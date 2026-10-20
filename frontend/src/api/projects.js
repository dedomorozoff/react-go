import client from './client'

export const projectsApi = {
  list(params = {}) {
    return client.get('/api/projects', { params })
  },
  get(id) {
    return client.get(`/api/projects/${id}`)
  },
  create(data) {
    return client.post('/api/projects', data)
  },
  update(id, data) {
    return client.put(`/api/projects/${id}`, data)
  },
  remove(id) {
    return client.delete(`/api/projects/${id}`)
  },
}
