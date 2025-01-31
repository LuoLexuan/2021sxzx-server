const comment = require("../model/comment")
const item = require("../model/item")
const itemRule = require("../model/itemRule")
const itemGuide = require("../model/itemGuide")
const rule = require("../model/rule")

/**
 * 保存用户的评论数据
 * @param commentData
 * @returns {Promise<EnforceDocument<unknown, {}>[]>}
 */
async function saveComment(commentData) {
  try {
    let res = await comment.create(commentData)
    return res;
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 获取用户的评论
 * @param pageNum
 * @param score
 * @returns {Promise<*>}
 */
async function getAllUserComment({pageNum , score}) {
  try {
    if(pageNum == 0){
      if(score !== 0) {
        let res = await comment.find({score:{$eq:score}}).lean()
        return res;
      } else {
        let res = await comment.find().lean()
        return res;
      }
    } else {
      if(score !== 0) {
        let res = await comment.find({score:{$eq:score}}).skip((pageNum-1)*10).limit(pageNum*10).lean()
        return res;
      } else {
        let res = await comment.find().skip((pageNum-1)*10).limit(pageNum*10).lean()
        return res;
      }
    }
  } catch (e) {
    return e.message;
  }
}

/**
 * 专门为解决bug写的返回全部评论数据的接口
 * @returns {Promise<*|*>}
 */
async function getAllUserComment2() {
  try {
    let res = await comment.find();
    return res;
  } catch (e) {
    return e.message;
  }
}

/**
 * 获取用户评价的参数
 * @returns {Promise<{scoreInfo: [], avgScore: number, totalNum: *}>}
 */
async function getCommentParam() {
  try {
    let res = await comment.aggregate([
      {
        $group: {
          _id: '$score',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort:{
          _id:1
        }
      }
    ])
    let res2 = []
    let avgScore = 0
    res.map(item => {
      let obj = {}
      obj.score = item['_id']
      obj.count = item['count']
      avgScore += item['_id'] * item['count']
      res2.push(obj)
    })
    let count = await getCommentTotal()
    avgScore /= count
    let res3 = {totalNum:count,avgScore:avgScore,scoreInfo:res2}
    return res3
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 获取评论总数
 * @returns {Promise<*>}
 */
async function getCommentTotal() {
  try {
    return await comment.find().count()
  } catch (e) {
    throw new Error(e.message)
  }
}

/**
 * 查找事项对应的事项指南的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getItemGuide(item_id){
  try {
    let itemData = await getItem(item_id)
    let data = await item.aggregate([
      {
        $lookup:{
          from:"item_guides",
          pipeline:[
            {
              $match:{
                item_guide_id:itemData.item_guide_id
              }
            }
          ],
          as: 'item_guide'
        }
      }
    ])
    return data[0].item_guide[0]
  } catch (e) {
    return e.message
  }
}

/**
 * 查找事项规则的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getItemRule(item_id) {
  try {
    let itemData = await getItem(item_id)
    let data = await item.aggregate([
      {
        $lookup:{
          from:"item_rules",
          pipeline:[
            {
              $match:{
                create_time:itemData.item_rule_id
              }
            }
          ],
          as: 'item_rule'
        }
      }
    ])
    return data[0].item_rule[0]
  } catch (e) {
    return e.message
  }
}

/**
 * 查找事项的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getItem(item_id){
  try {
    let data = await item.find({item_id})
    return data[0];
  } catch (e) {
    return e.message
  }
}

/**
 * 查找规则的方法
 * @param item_id 事项编码
 * @returns {Promise<*>}
 */
async function getRule(item_id) {
  try {
    let itemRuleData = await getItemRule(item_id)
    let data = await rule.find({rule_id:itemRuleData.rule_id})
    return data[0]
  } catch (e) {
    return e.message
  }
}

/**
 * 将评论对应的事项的详细信息全部返回
 * @returns {Promise<*>}
 */
async function getCommentDetail({pageNum,score}) {
  try {
    let commentArr = await getAllUserComment({pageNum, score})
    for(let i=0;i<commentArr.length;i++) {
      let item_id = commentArr[i].item_id
      let ruleData = await getRule(item_id)
      let item_guide = await getItemGuide(item_id)
      let item_rule = await getItemRule(item_id)
      commentArr[i].rule = ruleData
      commentArr[i].item_guide = item_guide
      commentArr[i].item_rule = item_rule
    }
    return commentArr
  } catch (e) {
    return e.message
  }
}

/**
 * 根据条件筛选评论数据
 * @param startTime
 * @param endTime
 * @param score
 * @param type
 * @param typeData
 * @returns {Promise<*>}
 */
async function searchByCondition({startTime,endTime,score,type,typeData}) {
  try {
    let condition = {}
    condition.pageNum = 0
    condition.score = score
    let commentData = await getCommentDetail(condition)
    let newCommentData = []
    if(endTime == 0) {
      newCommentData = commentData.filter((currentItem, currentIndex) => {
        return parseInt(currentItem.create_time) >= parseInt(startTime)
      })
    } else {
      newCommentData = commentData.filter((currentItem, currentIndex) => {
        return (parseInt(currentItem.create_time) >= parseInt(startTime) && parseInt(currentItem.create_time) <= parseInt(endTime))
      })
    }
    if(typeData === "") {
      return newCommentData
    }
    type = parseInt(type)
    console.log(type);
    switch (type) {
      case 0:
        break
      case 1:
        newCommentData = newCommentData.filter((currentItem, currentIndex) => {
          return currentItem.idc.indexOf(typeData) !== -1
        })
        break
      case 2:
        newCommentData = newCommentData.filter((currentItem, currentIndex) => {
          return currentItem.item_guide.item_guide_name.indexOf(typeData) !== -1
        })
        break
      case 3:
        newCommentData = newCommentData.filter((currentItem, currentIndex) => {
          return currentItem.item_guide.item_guide_id.indexOf(typeData) !== -1
        })
        break
      case 4:
        newCommentData = newCommentData.filter((currentItem, currentIndex) => {
          return currentItem.rule.rule_name.indexOf(typeData) !== -1
        })
        break
    }
    return newCommentData
  } catch (e) {
    return e.message
  }
}


module.exports = {
  saveComment,
  getCommentParam,
  getCommentDetail,
  getAllUserComment2,
  searchByCondition
}
