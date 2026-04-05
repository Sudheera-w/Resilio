import { http } from './httpClient';

export const resourcesApi = {
    getAll:   ()         => http.get('/api/resources'),
    create:   (data)     => http.post('/api/resources', data),
    update:   (id, data) => http.put(`/api/resources/${id}`, data),
    delete:   (id)       => http.delete(`/api/resources/${id}`),
    allocate: (id, data) => http.post(`/api/resources/${id}/allocate`, data),
    release:  (id)       => http.post(`/api/resources/${id}/release`),
};