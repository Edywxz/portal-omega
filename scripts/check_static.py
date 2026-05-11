#!/usr/bin/env python3
"""Static portal checks for Portal Omega.

Uses only Python's standard library. It is intended for maintainers and
agentic checks in environments where Node.js is not available.
"""

from __future__ import annotations

import argparse
import contextlib
import os
import re
import sys
import threading
from dataclasses import dataclass, field
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urldefrag, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
HTML_PAGES = (
    "index.html",
    "sobre.html",
    "cursos.html",
    "noticias.html",
    "eventos.html",
    "contato.html",
    "login.html",
    "area-estudante.html",
)
REQUIRED_DIRS = (
    "src/assets/css",
    "src/assets/img",
    "src/components",
    "src/pages",
    "src/services",
    "src/utils",
    "public",
    "docs",
    "scripts",
    "tests",
)
REQUIRED_HOME_SECTIONS = ("conteudo", "acoes-rapidas", "sobre", "noticias", "cursos", "eventos", "servicos", "contato")
PAGE_CONTRACTS = {
    "sobre.html": {"data-page": "about", "ids": ("conteudo", "transparencia", "indicadores")},
    "cursos.html": {"data-page": "courses", "ids": ("conteudo", "course-list", "vestibular", "graduacao", "extensao", "continuada")},
    "noticias.html": {"data-page": "news", "ids": ("conteudo", "news-list")},
    "eventos.html": {"data-page": "events", "ids": ("conteudo", "event-list", "calendario", "editais")},
    "contato.html": {"data-page": "contact", "ids": ("conteudo", "contato", "contact-form", "contact-status", "contact-channels", "ouvidoria")},
}
LEGACY_REFERENCES = ("src/assets/css/styles.css", "src/assets/js/script.js", "src/assets/js/student-area.js", "src/assets/js/page-transition.js")
LARGE_ASSET_BYTES = 2 * 1024 * 1024


@dataclass
class CheckReport:
    failures: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    passes: list[str] = field(default_factory=list)

    def pass_(self, message: str) -> None:
        self.passes.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    def fail(self, message: str) -> None:
        self.failures.append(message)


class PortalHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.stylesheets: list[str] = []
        self.scripts: list[tuple[str, str]] = []
        self.images: list[str] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {name: value or "" for name, value in attrs}

        if "id" in attr:
            self.ids.add(attr["id"])

        if tag == "a" and attr.get("href"):
            self.links.append(attr["href"])
        elif tag == "link" and attr.get("rel") == "stylesheet" and attr.get("href"):
            self.stylesheets.append(attr["href"])
        elif tag == "script" and attr.get("src"):
            self.scripts.append((attr.get("src", ""), attr.get("type", "")))
        elif tag == "img" and attr.get("src"):
            self.images.append(attr["src"])


def is_external(reference: str) -> bool:
    parsed = urlparse(reference)
    return bool(parsed.scheme and parsed.scheme not in {"file"}) or reference.startswith(("mailto:", "tel:", "javascript:"))


def local_path(base_file: Path, reference: str) -> Path | None:
    clean_reference, _fragment = urldefrag(reference)

    if not clean_reference or clean_reference.startswith("#") or is_external(clean_reference):
        return None

    return (base_file.parent / clean_reference).resolve()


def read_text(path: Path, report: CheckReport) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        report.fail(f"{path.relative_to(ROOT)} is not valid UTF-8 text")
    except OSError as error:
        report.fail(f"Could not read {path.relative_to(ROOT)}: {error}")

    return ""


def parse_html(path: Path, report: CheckReport) -> PortalHTMLParser:
    parser = PortalHTMLParser()
    parser.feed(read_text(path, report))
    return parser


def check_required_structure(report: CheckReport) -> None:
    for directory in REQUIRED_DIRS:
        path = ROOT / directory
        if path.is_dir():
            report.pass_(f"Directory exists: {directory}")
        else:
            report.fail(f"Missing required directory: {directory}")

    for page in HTML_PAGES:
        path = ROOT / page
        if path.is_file():
            report.pass_(f"Page exists: {page}")
        else:
            report.fail(f"Missing required page: {page}")


def check_html_contracts(report: CheckReport) -> list[Path]:
    resources: list[Path] = []

    for page in HTML_PAGES:
        path = ROOT / page
        parser = parse_html(path, report)

        if not parser.stylesheets:
            report.fail(f"{page} has no stylesheet")

        for stylesheet in parser.stylesheets:
            target = local_path(path, stylesheet)
            if target and target.is_file():
                resources.append(target)
            elif target:
                report.fail(f"{page} references missing stylesheet: {stylesheet}")

        for script_src, script_type in parser.scripts:
            target = local_path(path, script_src)
            if script_type != "module":
                report.fail(f"{page} script is not type=\"module\": {script_src}")
            if target and target.is_file():
                resources.append(target)
            elif target:
                report.fail(f"{page} references missing script: {script_src}")

        for image in parser.images:
            target = local_path(path, image)
            if target and target.is_file():
                resources.append(target)
            elif target:
                report.fail(f"{page} references missing image: {image}")

        for href in parser.links:
            target = local_path(path, href)
            clean_href, fragment = urldefrag(href)
            target_page = target if target and clean_href else path

            if target and clean_href and not target.exists():
                report.fail(f"{page} references missing local link target: {href}")
                continue

            if fragment and target_page.suffix == ".html" and target_page.exists():
                target_parser = parse_html(target_page, report)
                if fragment not in target_parser.ids:
                    report.fail(f"{page} links to missing anchor #{fragment} in {target_page.name}")

        report.pass_(f"HTML references resolved: {page}")

    home_parser = parse_html(ROOT / "index.html", report)
    for section_id in REQUIRED_HOME_SECTIONS:
        if section_id in home_parser.ids:
            report.pass_(f"Home section exists: #{section_id}")
        else:
            report.fail(f"Home is missing required section id: #{section_id}")

    login_text = read_text(ROOT / "login.html", report)
    student_text = read_text(ROOT / "area-estudante.html", report)

    if 'data-page="login"' in login_text:
        report.pass_("Login page has data-page contract")
    else:
        report.fail('login.html must include body data-page="login"')

    if 'data-page="student-area"' in student_text:
        report.pass_("Student area page has data-page contract")
    else:
        report.fail('area-estudante.html must include body data-page="student-area"')

    for page, contract in PAGE_CONTRACTS.items():
        page_text = read_text(ROOT / page, report)
        page_parser = parse_html(ROOT / page, report)
        expected_page = contract["data-page"]

        if f'data-page="{expected_page}"' in page_text:
            report.pass_(f"{page} has data-page contract")
        else:
            report.fail(f'{page} must include body data-page="{expected_page}"')

        for element_id in contract["ids"]:
            if element_id in page_parser.ids:
                report.pass_(f"{page} has required id: #{element_id}")
            else:
                report.fail(f"{page} is missing required id: #{element_id}")

    return resources


def referenced_css_paths(css_file: Path, report: CheckReport) -> list[Path]:
    css = read_text(css_file, report)
    paths: list[Path] = []

    for match in re.finditer(r'@import\s+url\(["\']?([^"\')]+)["\']?\)|url\(["\']?([^"\')]+)["\']?\)', css):
        reference = match.group(1) or match.group(2)

        if not reference or is_external(reference) or reference.startswith("data:"):
            continue

        target = (css_file.parent / reference).resolve()

        if target.exists():
            paths.append(target)
        else:
            report.fail(f"{css_file.relative_to(ROOT)} references missing CSS asset: {reference}")

    return paths


def check_css_graph(resources: Iterable[Path], report: CheckReport) -> list[Path]:
    discovered: list[Path] = []
    visited: set[Path] = set()
    stack = [path for path in resources if path.suffix == ".css"]

    while stack:
        css_file = stack.pop()

        if css_file in visited:
            continue

        visited.add(css_file)
        for target in referenced_css_paths(css_file, report):
            discovered.append(target)
            if target.suffix == ".css":
                stack.append(target)

    report.pass_(f"CSS graph resolved ({len(visited)} CSS files checked)")
    return discovered


def check_js_imports(report: CheckReport) -> list[Path]:
    discovered: list[Path] = []

    for js_file in sorted((ROOT / "src").rglob("*.js")):
        js = read_text(js_file, report)

        for match in re.finditer(r'(?:import\s+(?:[^"\']+\s+from\s+)?|export\s+[^"\']+\s+from\s+)["\']([^"\']+)["\']', js):
            reference = match.group(1)

            if not reference.startswith("."):
                continue

            target = (js_file.parent / reference).resolve()

            if target.exists():
                discovered.append(target)
            else:
                report.fail(f"{js_file.relative_to(ROOT)} references missing JS import: {reference}")

    report.pass_("JavaScript module imports resolved")
    return discovered


def check_legacy_references(report: CheckReport) -> None:
    searchable_files = list(ROOT.glob("*.html")) + list((ROOT / "src").rglob("*.css")) + list((ROOT / "src").rglob("*.js"))

    for file in searchable_files:
        text = read_text(file, report)
        for reference in LEGACY_REFERENCES:
            if reference in text:
                report.fail(f"{file.relative_to(ROOT)} still references legacy asset: {reference}")

    report.pass_("No legacy static asset references found")


@contextlib.contextmanager
def static_server() -> Iterable[str]:
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, _format: str, *args: object) -> None:
            return

    previous_cwd = Path.cwd()
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
        os.chdir(previous_cwd)


def request_head(url: str) -> tuple[int, str]:
    request = Request(url, method="HEAD")

    with urlopen(request, timeout=8) as response:
        return response.status, response.headers.get("content-type", "")


def check_http_loading(paths: Iterable[Path], report: CheckReport) -> None:
    unique_paths = []
    seen: set[Path] = set()

    for path in [ROOT / page for page in HTML_PAGES] + list(paths):
        if not path.exists() or path in seen or not path.is_file():
            continue

        seen.add(path)
        unique_paths.append(path)

    with static_server() as base_url:
        for path in unique_paths:
            relative = path.relative_to(ROOT).as_posix()
            url = f"{base_url}/{relative}"

            try:
                status, content_type = request_head(url)
            except HTTPError as error:
                report.fail(f"HTTP {error.code} for {relative}")
                continue
            except URLError as error:
                report.fail(f"Could not load {relative}: {error.reason}")
                continue

            if status != 200:
                report.fail(f"HTTP {status} for {relative}")
                continue

            if not content_type:
                report.warn(f"No content-type returned for {relative}")

        report.pass_(f"HTTP loading passed for {len(unique_paths)} files")


def check_large_assets(report: CheckReport) -> None:
    for asset in (ROOT / "src/assets/img").glob("*"):
        if not asset.is_file():
            continue

        size = asset.stat().st_size
        if size > LARGE_ASSET_BYTES:
            size_mb = size / (1024 * 1024)
            report.warn(f"Large image asset: {asset.relative_to(ROOT)} ({size_mb:.1f} MB)")


def print_report(report: CheckReport, verbose: bool) -> None:
    if verbose:
        for message in report.passes:
            print(f"PASS {message}")

    for message in report.warnings:
        print(f"WARN {message}")

    for message in report.failures:
        print(f"FAIL {message}")

    print()
    print(f"Summary: {len(report.passes)} passed, {len(report.warnings)} warnings, {len(report.failures)} failures")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run static checks for Portal Omega without Node.js.")
    parser.add_argument("--verbose", action="store_true", help="Show every passing check.")
    parser.add_argument("--no-http", action="store_true", help="Skip temporary HTTP server loading checks.")
    args = parser.parse_args()

    report = CheckReport()

    check_required_structure(report)
    html_resources = check_html_contracts(report)
    css_resources = check_css_graph(html_resources, report)
    js_resources = check_js_imports(report)
    check_legacy_references(report)
    check_large_assets(report)

    if not args.no_http:
        check_http_loading([*html_resources, *css_resources, *js_resources], report)

    print_report(report, args.verbose)
    return 1 if report.failures else 0


if __name__ == "__main__":
    sys.exit(main())
