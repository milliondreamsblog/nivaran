// Small unique id for cases, messages and evidence. Kept free of React so pure helpers and tests can use it.
export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
