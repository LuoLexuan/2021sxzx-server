//========== 为何总要弄一个List出来？为了让前端更新列表数据更加方便 ============//

const {
  addUser,
  getUserList,
  updateUser,
  deleteUser,
  searchUser
} = require('../service/userManagementService')

const {SuccessModel, ErrorModel} = require('../utils/resultModel');

async function addUserAndReturnList (userInfo) {
  try {
    await addUser(userInfo)
    const res = await getUserList()
    return res
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

async function returnList () {
  try {
    const res = await getUserList()
    return res
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

async function updateUserAndReturnList (user_name, password) {
  try {
    await updateUser(user_name, password)
    const res = await getUserList()
    return res
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

async function deleteUserAndReturnList (account) {
  try {
    await deleteUser(account)
    const res = await getUserList()
    return res
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

async function searchUserAndReturnList (searchValue) {
  try {
    await searchUser(searchValue)
    const res = await getUserList()
    return res
  } catch (e) {
    return new ErrorModel({msg: e.message})
  }
}

module.exports = {
  addUserAndReturnList,
  returnList,
  updateUserAndReturnList,
  deleteUserAndReturnList,
  searchUserAndReturnList
}