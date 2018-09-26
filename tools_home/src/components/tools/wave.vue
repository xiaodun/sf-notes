<template>
  <div id="test_vue">
  	<div style="width:  calc((100% - 20vmin)/2)"></div>
    <div class="g-container">
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {

    }
  },
  methods: {

  },
  mounted(){
  	(function() {
    let x, y;
    let index = 0;
    let screenSizeWidth = $('body').width();
    let screenSizeHeight = $('body').height();
    let halfvmin = (screenSizeWidth > screenSizeHeight ? screenSizeHeight / 2 : screenSizeWidth / 2) * 0.8;
    
    console.log('halfvmin', halfvmin);
    
    $(document).on("click", function(e) {
        x = e.pageX;
        y = e.pageY;
        waveMove(x, y, index++);
    });

    function waveMove(x, y, z) {
        $(".g-container").append(`
            <div class="g-position g-position${z}" style="top:${y - halfvmin}px; left:${x - halfvmin}px; z-index:${z}">
                <div class="g-center">
                    <div class="wave g-wave1"></div>
                    <div class="wave g-wave2"></div>
                    <div class="wave g-wave3"></div>
                    <div class="wave g-wave4"></div>
                </div>
            </div>
        `);
        
        setTimeout(function() {
            $(`.g-position${z}`).remove();
        }, 3000);
    }
})();

  }

}

</script>
<style lang="scss">
	$img: 'https://images.unsplash.com/photo-1440688807730-73e4e2169fb8?dpr=1&auto=format&fit=crop&w=1500&h=1001&q=80&cs=tinysrgb&crop=';
$aniTime: 1s;

body,
html {
    width: 100%;
    height: 100%;
}
.g-container{
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: url($img);
    background-attachment: fixed;
    background-position: center center; 
    // background-size: auto;
    background-size: auto 100%;
    overflow: hidden;
    cursor: pointer;
    
}

.g-position {
    position:absolute;
    width: 80vmin;
    height: 80vmin;
}

.g-center {
    position: relative;
    width: 100%;
    height: 100%;
}

.wave {
    position: absolute;
    top: calc((100% - 20vmin)/2);
    left: calc((100% - 20vmin)/2);
    width: 20vmin;
    height: 20vmin;
    border-radius: 50%;
    background-image: url($img);
    background-attachment: fixed;
    background-position: center center;
    transform: translate3d(0, 0, 0);
    opacity: 0;
    transition: all .2s;
}

.g-wave1 {
    background-size: auto 106%;
    animation: wave $aniTime ease-out .1s;
    animation-fill-mode: forwards;
    z-index: 10;
}

.g-wave2 {
    background-size: auto 102%;
    animation: wave $aniTime ease-out .15s;
    animation-fill-mode: forwards;
    z-index: 20;
}

.g-wave3 {
    background-size: auto 104%;
    animation: wave $aniTime ease-out .25s;
    animation-fill-mode: forwards;
    z-index: 30;
}

.g-wave4 {
    background-size: auto 100%;
    animation: wave $aniTime ease-out .4s;
    animation-fill-mode: forwards;
    z-index: 40;
}

@keyframes wave {
    0% {
        top: calc((100% - 20vmin)/2);
        left: calc((100% - 20vmin)/2);
        width: 20vmin;
        height: 20vmin;
        opacity: 1;
    }
    10% {
        // opacity: 1;
    }
    99% {
        opacity: 1;
    }
    100% {
        top: calc((100% - 80vmin)/2);
        left: calc((100% - 80vmin)/2);
        width: 80vmin;
        height: 80vmin;
        opacity: 0;
    }
}
</style>
