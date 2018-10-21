import axios from "axios";
import builtService from '@root/service/app/config.json';
var instance = axios.create({
    baseURL:"/"+builtService.prefix,
});
// instance.interceptors.request.use(function(){

// })
// instance.interceptors.response.use(function(){

// })

class Helper {
    request(options){
        return instance(options);
    }
}
var helper = new Helper();

export default helper;