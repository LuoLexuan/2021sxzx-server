const {
    getSystemLogDetail,
    getAllSystemLog2,
    searchByCondition
  } = require("../service/SystemLogService")
  const {SuccessModel, ErrorModel} = require('../utils/resultModel');
    
  /**
   * 获取系统日志(不包括操作人)
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
  async function getSystemLog2() {
    try {
      let data = await getAllSystemLog2();
      return new SuccessModel({msg: '获取系统日志成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  /**
   * 获取系统日志(包括操作人)
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
  async function getAllSystemLogDetail() {
    try {
      let data = await getSystemLogDetail();
      return new SuccessModel({msg: '获取系统日志成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

  /**
   * 根据条件搜索日志
   * @param searchData
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
  async function getSearchSystemLog(searchData) {
    let {myself,today,thisWeek} = searchData
    if(!myself) {
      myself = false
    }
    if(!today) {
      today = false;
    }
    if(!thisWeek) {
      thisWeek = false
    }
    try {
      let data = await searchByCondition({myself,today,thisWeek})
      return new SuccessModel({msg: '查询成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }
  
  module.exports = {
    getSearchSystemLog,
    getAllSystemLogDetail
  }
  