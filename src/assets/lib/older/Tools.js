/*
	封装一些常用的方法
*/

class Tools {
	/*
		var flag = Tools.timeout({func:()=>{
			console.log(1)
		},time:4000});

		setTimeout(()=>{
			flag.isGoon = false;
		},1000)
	*/
	interval({func,time = 1000,immediately = false}){
		if(immediately){
			func();
		}
		let flag = {
			isGoon:true,
			index:0
		}
		function wrapper(){
			if(flag.isGoon){

				func()
			}
			else{
				clearInterval(flag.index);
			}
		}
		flag.index = setInterval(wrapper,time);
		return flag
	}
	//同interval
	timeout({func,time = 1000,immediately = false}){
		if(immediately){
			func();
		}
		let flag = {
			isGoon:true,
		}
		function wrapper(){
			if(flag.isGoon){
				func();
				setTimeout(wrapper,time)
			}
		}
		setTimeout(wrapper,time)
		return flag
	}
}

const tools = new Tools();
export default tools;