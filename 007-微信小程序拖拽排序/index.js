// pages/user/pages/area/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [
      {
        id: '1',
        name: '中央球机',
        nameIcon:'../../../../image/more.png',
      },
      {
        id: '2',
        name: '2号地',
        nameIcon:'../../../../image/more.png',
      },
      {
        id: '3',
        name: '3号地',
        nameIcon:'../../../../image/more.png',
      },
      {
        id: '4',
        name: '4号地',
        nameIcon:'../../../../image/more.png',
      },
      {
        id: '5',
        name: '5号地',
        nameIcon:'../../../../image/more.png',
      },
      {
        id: '6',
        name: '6号地',
        nameIcon:'../../../../image/more.png',
      },
    ],
    isSelect: {
      id: '2',
      name: '4号地',
      nameIcon:'../../../../image/more.png',
    },
    dialogShow: false,
    buttons: [{text: '取消'}, {text: '确定'}],
    showTopTips:false,
    inputText:'',
    showkelong:false,
    kelong: {
        top: 0,
        name: '',
        id: '2',
        name: '4号地',
        nameIcon:'../../../../image/more.png',
      },
    replace: {
        name: '',
      },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  handleDelete(e){
      let cur=this.data.list.find((item)=>{return item.id == e.currentTarget.id});
      wx.showModal({
        title: '删除提示',
        content: `确定要删除 ${cur.name} 区域？`,
        confirmColor:'#e4463b',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
  },
  dragStart: function(e) {
    var that = this
    var kelong = that.data.kelong
    var i = e.currentTarget.dataset.index
    kelong.name = this.data.list[i].name
    var query = wx.createSelectorQuery();
    
    //选择id
    query.select('.list').boundingClientRect(function(rect) {
      kelong.top = e.changedTouches[0].clientY - rect.top
      console.log("dragStart",kelong.top)
      that.setData({
        kelong: kelong,
        showkelong: true
      })
    }).exec();
  },
  dragMove: function(e) {
    var that = this
    // var i = e.currentTarget.dataset.index
    var query = wx.createSelectorQuery();
    var kelong = that.data.kelong
    // var listnum = that.data.list.length
    // var list = that.data.list
    query.select('.list').boundingClientRect(function(rect) {
      kelong.top = e.changedTouches[0].clientY - rect.top
      // console.log("dragMove",kelong.top,rect.height)
      if(kelong.top < 60) {
        kelong.top = 60
      } else if (kelong.top > rect.height - 40) {
        // console.log("dragMove",kelong.top)
        kelong.top = rect.height - 40
      }
      that.setData({
        kelong: kelong,
      })
    }).exec();
  },
  dragEnd: function(e) {
    var that = this
    var i = e.currentTarget.dataset.index
    var query = wx.createSelectorQuery();
    var kelong = that.data.kelong
    // var listnum = that.data.list.length
    var list = that.data.list
    query.select('.list').boundingClientRect(function (rect) {
      kelong.top = e.changedTouches[0].clientY - rect.top
      // if(kelong.top<-20){
      //   wx.showModal({
      //     title: '删除提示',
      //     content: '确定要删除此条记录？',
      //     confirmColor:'#e4463b'
      //   })
      // }
      var target = parseInt(kelong.top / 48)-1
      var replace = that.data.replace
      // console.log("dragEnd",target,i)
      if (target >= 0) {
        // 互换位置
        // replace.name = list[target].name
        // list[target].name = list[i].name
        // list[i].name = replace.name

        // 位置下沿
        replace = list.splice(i,1);
        list.splice(target,0,replace[0]);
        // console.log("dragEnd",target,i,replace,list)
      }
      that.setData({
        list: list,
        showkelong:false
      })
    }).exec();
  },
})