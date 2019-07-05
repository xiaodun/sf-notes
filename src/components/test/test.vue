


<template>
  <div
    id="test-vue-id"
    ref="testDom"
  >
    <!-- <embed
      type="application/x-shockwave-flash"
      src="http://player.cntv.cn/standard/cntvplayerQC20181126.swf?v=0.171.5.8.9.6.3.5.2"
      width="670"
      height="500"
      style=""
      id="vplayer"
      name="vplayer"
      bgcolor="#000000"
      quality="high"
      wmode="Transparent"
      menu="false"
      allowfullscreen="true"
      allowscriptaccess="always"
      data-spm-anchor-id="0.0.0.i0"
      class=""
      flashvars="dynamicDataPath=http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do&amp;videoId=364985915761303&amp;videoCenterId=739e80c56458425a8c12e6f2140c0a52&amp;"
    > -->

    
    <object width="160" height="144"  >
   <param name="src" value="/static/flash7097.swf">
   <param name="autoplay" value="false">
   <param name="controller" value="true">
</object>
           

    <!-- <object
      type="application/x-shockwave-flash"
      data="/static/media/player-quick.b99047c4.swf"
      id="88185"
      width="100%"
      height="100%"
      rtmpurl="11111111111111"
    >
      <param
        name="flashvars"
        value="playerID=88185&amp;rtmp=rtmp://192.168.38.46/live/live88185&amp;autoplay=true&amp;showErrorInPlayer=false&amp;showMetadata=false&amp;showLiveCaption=false&amp;livelabelshowbg=true"
      >
      <param
        name="allowfullscreen"
        value="true"
      >
      <param
        name="allowscriptaccess"
        value="sameDomain"
      >
      <param
        name="bgcolor"
        value="transparent"
      >
      <param
        name="wmode"
        value="transparent"
      ></object> -->
    <!-- <embed
      type="application/x-shockwave-flash"
      src="http://192.168.38.46/live/live88185/static/media/player-quick.b99047c4.swf"
      width="670"
      height="500"
      style=""
      id="vplayer"
      name="vplayer"
      bgcolor="#000000"
      quality="high"
      wmode="Transparent"
      menu="false"
      allowfullscreen="true"
      allowscriptaccess="always"
      data-spm-anchor-id="0.0.0.i0"
      class=""
      flashvars="autoplay=true&amp;showErrorInPlayer=false&amp;showMetadata=false&amp;showLiveCaption=false&amp;livelabelshowbg=true"
    > -->

  </div>

</template>

    <script>
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {},

  mounted() {
    const user2 = {
      id: 200,
      name: "Vince Noir"
    };

    let renamed = ({ id, ...rest }) => ({ ID: id, ...rest });
    console.log(renamed(user2));
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}

</style>
