const OMEGA_STUDENT_STORAGE_KEY = "omegaStudentMock";

export const saveStudent = (student) => {
    sessionStorage.setItem(OMEGA_STUDENT_STORAGE_KEY, JSON.stringify(student));
};

export const readStudent = () => {
    const rawStudent = sessionStorage.getItem(OMEGA_STUDENT_STORAGE_KEY);

    if (!rawStudent) {
        return null;
    }

    try {
        return JSON.parse(rawStudent);
    } catch (error) {
        sessionStorage.removeItem(OMEGA_STUDENT_STORAGE_KEY);
        return null;
    }
};

export const clearStudent = () => {
    sessionStorage.removeItem(OMEGA_STUDENT_STORAGE_KEY);
};
