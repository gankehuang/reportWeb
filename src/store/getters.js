const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  userId: state => state.user.userId,
  roles: state => state.user.roles,
  orgInfo: state => state.user.orgInfo,
  planYearMonth: state => state.user.planYearMonth,
  number: state => state.user.number
}
export default getters
