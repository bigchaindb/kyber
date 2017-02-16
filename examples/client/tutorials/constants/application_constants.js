export const FLASK_BASE_URL = process.env.FLASK_BASE_URL;
export const BDB_SERVER_URL = process.env.BDB_SERVER_URL || 'http://localhost:9984';
export const API_PATH = `${BDB_SERVER_URL}/api/v1/`;

export default {
    API_PATH,
    FLASK_BASE_URL,
};
