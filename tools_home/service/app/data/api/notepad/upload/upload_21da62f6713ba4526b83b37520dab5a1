<template>
  <div id="rotate_clock">

	<div class="clock">
		<div class="middle">		</div>
		<div class="line-minute line-minute-1"></div>
		<div class="line-minute line-minute-2"></div>
		<div class="line-minute line-minute-3"></div>
		<div class="line-minute line-minute-4"></div>
		<div class="line-minute line-minute-5"></div>
		<div class="line-minute line-minute-6"></div>
		<div class="line-minute line-minute-7"></div>
		<div class="line-minute line-minute-8"></div>
		<div class="line-minute line-minute-9"></div>
		<div class="line-minute line-minute-10"></div>
		<div class="line-minute line-minute-11"></div>
		<div class="line-minute line-minute-12"></div>
		<div class="line-minute line-minute-13"></div>
		<div class="line-minute line-minute-14"></div>
		<div class="line-minute line-minute-15"></div>
		<div class="line-minute line-minute-16"></div>
		<div class="line-minute line-minute-17"></div>
		<div class="line-minute line-minute-18"></div>
		<div class="line-minute line-minute-19"></div>
		<div class="line-minute line-minute-20"></div>
		<div class="line-minute line-minute-21"></div>
		<div class="line-minute line-minute-22"></div>
		<div class="line-minute line-minute-23"></div>
		<div class="line-minute line-minute-24"></div>
		<div class="line-minute line-minute-25"></div>
		<div class="line-minute line-minute-26"></div>
		<div class="line-minute line-minute-27"></div>
		<div class="line-minute line-minute-28"></div>
		<div class="line-minute line-minute-29"></div>
		<div class="line-minute line-minute-30"></div>
		<div class="line-minute line-minute-31"></div>
		<div class="line-minute line-minute-32"></div>
		<div class="line-minute line-minute-33"></div>
		<div class="line-minute line-minute-34"></div>
		<div class="line-minute line-minute-35"></div>
		<div class="line-minute line-minute-36"></div>
		<div class="line-minute line-minute-37"></div>
		<div class="line-minute line-minute-38"></div>
		<div class="line-minute line-minute-39"></div>
		<div class="line-minute line-minute-40"></div>
		<div class="line-minute line-minute-41"></div>
		<div class="line-minute line-minute-42"></div>
		<div class="line-minute line-minute-43"></div>
		<div class="line-minute line-minute-44"></div>
		<div class="line-minute line-minute-45"></div>
		<div class="line-minute line-minute-46"></div>
		<div class="line-minute line-minute-47"></div>
		<div class="line-minute line-minute-48"></div>
		<div class="line-minute line-minute-49"></div>
		<div class="line-minute line-minute-50"></div>
		<div class="line-minute line-minute-51"></div>
		<div class="line-minute line-minute-52"></div>
		<div class="line-minute line-minute-53"></div>
		<div class="line-minute line-minute-54"></div>
		<div class="line-minute line-minute-55"></div>
		<div class="line-minute line-minute-56"></div>
		<div class="line-minute line-minute-57"></div>
		<div class="line-minute line-minute-58"></div>
		<div class="line-minute line-minute-59"></div>
		<div class="line-minute line-minute-60"></div>

		<div class="line-hour line-hour-1"></div>
		<div class="line-hour line-hour-2"></div>
		<div class="line-hour line-hour-3"></div>
		<div class="line-hour line-hour-4"></div>
		<div class="line-hour line-hour-5"></div>
		<div class="line-hour line-hour-6"></div>
		<div class="line-hour line-hour-7"></div>
		<div class="line-hour line-hour-8"></div>
		<div class="line-hour line-hour-9"></div>
		<div class="line-hour line-hour-10"></div>
		<div class="line-hour line-hour-11"></div>
		<div class="line-hour line-hour-12"></div>
		<div class="number-container">
			
			<div class="number number-1">1</div>
			<div class="number number-2">2</div>
			<div class="number number-3">3</div>
			<div class="number number-4">4</div>
			<div class="number number-5">5</div>
			<div class="number number-6">6</div>
			<div class="number number-7">7</div>
			<div class="number number-8">8</div>
			<div class="number number-9">9</div>
			<div class="number number-10">10</div>
			<div class="number number-11">11</div>
			<div class="number number-12">12</div>
		</div>
		<div class="pointer-hour"></div>
		<div class="pointer-minute"></div>
		<div class="pointer-second"></div>
	</div>

  </div>
</template>
<script>
export default {
	name:"rotate_clock",
	data(){
		return{

		}
	},
	computed:{

	},
	methods:{

	},
	mounted(){
		let pointerSecond_dom = document.getElementsByClassName("pointer-second")[0],
			pointerHour_dom = document.getElementsByClassName("pointer-hour")[0],
			pointerMinute_dom = document.getElementsByClassName("pointer-minute")[0];

		function movePointer(){
			let date = new Date(),
				second = date.getSeconds(),
				hour = date.getHours(),
				minute = date.getMinutes();

			pointerSecond_dom.style.transform = `rotate(${second*6-90}deg)`; 
			pointerMinute_dom.style.transform = `rotate(${minute*6+second*0.1-90}deg)`; 
			pointerHour_dom.style.transform = `rotate(${hour*30+minute*0.5 - 90}deg)`; 
		}
		setInterval(movePointer);
	}
}

</script>
<style lang="less">
@import "../../assets/style/base.less";
.clock{
	position: relative;
	.circle(200px);
	background-color: #292a38;
	margin: 50px auto;
}
.middle{
	.vertical_transform(absolute);
	.circle(10px);
	background-color: #fff;

}
.line-create(@name,@count,@number,@tansX) when (@number > 0){
	.@{name}@{number}{
		transform: rotate(360deg/@count*@number) translate(@tansX,-50%);
	}
	.line-create(@name,@count,@number - 1 ,@tansX);
}
.line-number(@name,@count,@number,@r) when (@number > 0){
	@arc:0.017453292519943295;
	.@{name}@{number}{
		left:@r + @r * cos(360/@count*(@number - 3)*@arc);
		top:@r + @r * sin(360/@count*(@number - 3)*@arc);
	}
	.line-number(@name,@count,@number - 1,@r);
}
.line-minute,.line-hour{
	position: absolute;
	left: 50%;
	top: 50%;
	background-color: #fff;
	z-index: 1;
	transform-origin: left center;
}
.number{
	position: absolute;
	color:#fff;
	top:0px;
	left:0px;
	transform:translate(-50%,-50%);
}
.line-minute{
	width: 5px;
	height: 2px;
}
.line-hour{
	width: 10px;
	height: 2px;
}
.line-number{
	width: 45px;
	height: 3px;

}
.number-container{
	@val:146px;
	.circle(@val);
	.vertical_transform(absolute);
	.line-number(number-,12,12,@val/2);
}
.pointer-hour{
	width: 45px;
	height: 3px;

}
.pointer-minute{
	width: 60px;
	height: 2px;
}
.pointer-second{
	width: 80px;
	height: 1px;
}
.pointer-second,.pointer-minute,.pointer-hour{
	position: absolute;
	top: 50%;
	left:50%;
	transform:translateY(-50%);
	background-color: #fff;
	transform-origin:left center;
}
.line-create(line-minute-,60,60,85px);
.line-create(line-hour-,12,12,80px);
</style>
