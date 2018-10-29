<style lang="less">
.divider {
  color: #9ea7b4;
}

#math-postures-id {
  position: relative;

  box-sizing: border-box;
  width: 85%;
  max-width: 960px;
  margin: 0 auto 10px;
  padding: 10px;

  border-radius: 10px;
  background-color: #fff;

  &:before {
    display: table;

    content: ' ';
  }

  .info {
    font-size: 14px;

    letter-spacing: 1px;

    color: #5e5e5e;
  }

  .title {
    margin: 40px 0 60px 0;

    color: #fb0;
  }

  .expression {
    font-size: 16px;
  }

  .submit {
    width: 100px;
  }

  .start {
    font-size: 40px;

    width: 100px;
    height: 100px;
    margin-right: 30px;
    margin-left: auto;

    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, .14),
    0 3px 14px 2px rgba(0, 0, 0, .12), 0 5px 5px -3px rgba(0, 0, 0, .3);
  }

  .list-leave-active {
    overflow: hidden;

    height: 60px;

    transition: all .35s linear;
  }

  .list-leave-to {
    // opacity: 0;
    height: 0;
  }
}

</style>
<template>
  <div id="math-postures-id">
    <h1 class="title">
      <Button class="start" :icon="isAnswerModel === false ?'md-play':'md-power'" :type="isAnswerModel === false ?'success':'error'" shape="circle" @click="toggle_model()"></Button>
      四则运算题
    </h1>

    <div v-show="isAnswerModel === false">
      <Divider orientation="left" class="divider">
        <span class="divider">说明 </span>
      </Divider>
      <p class="info">
        在计算过程和结果中,会出现小数,但被控制在有限、2位之内
      </p>
      <p class="info">

        参于计算的数、结果、计算过程都不会出现负数

      </p>
      <p class="info">
        在单个输入框按下Enter可提交
      </p>
      <Divider orientation="left" class="divider">
        <span class="divider">
          当前配置
        </span>
      </Divider>

      <Card style="clear: both;margin-top: 10px">
        <CellGroup>
          <Cell>

            <Button size="small" slot="extra" type="info" @click="edit_config_modal" shape="circle" icon="ios-hammer-outline" class="update_config"></Button>
          </Cell>
          <Cell title="包含的运算">
            <p slot="extra">
              {{include_sign_info}}
            </p>
          </Cell>
          <Cell title="允许出现括号">
            <p slot="extra">

              {{isIncludeBrackets ? '是' : '否'}}
            </p>
          </Cell>
          <Cell title="题目个数">
            <p slot="extra">

              {{count }}
            </p>
          </Cell>
          <Cell title="单个数字最大值">
            <p slot="extra">

              {{numberModel.max }}
            </p>
          </Cell>
          <Cell title="数字的个数">
            <p slot="extra">

              {{numberModel.count }}
            </p>
          </Cell>
        </CellGroup>
      </Card>
    </div>
    <div class="answer_area" v-show="isAnswerModel">
      <Divider orientation="left">
        <span class="divider">答题区域</span>
      </Divider>
      <Form ref="formInline">
        <transition-group name="list">

          <FormItem :key="index" v-show="item.isShow" v-for="(item,index ) in answer">
            <span class="expression">{{item.expression}}</span>
            <Input  @focus="'focus'+index" :ref="'input'+index" type="text" @on-keydown.enter="submit" v-model="item.userResult" />
          </FormItem>
        </transition-group>
        <FormItem>
          <Button @click="submit" class="submit" size="large" type="primary" v-t="'ti_jiao'"></Button>
        </FormItem>
      </Form>
      <div>

      </div>
    </div>
    <Modal @on-ok="close_config_modal" v-model="configModal.isShow" title="修改配置" :mask-closable="false">
      <Form :label-width="120" label-position="left">
        <FormItem label="包含的运算">

          <Checkbox :key="key" v-for="(value,key) in configModal.signModel" @on-change="change_include_sign(key)" v-model="value.isInclude">{{value.content}}</Checkbox>

        </FormItem>
        <FormItem label="允许出现括号">
          <i-switch v-model="configModal.isIncludeBrackets"></i-switch>
        </FormItem>
        <FormItem label="题目个数">
          <Select v-model="configModal.count" style="width: 100px;">
            <Option :value="5">5</Option>
            <Option :value="10">10</Option>
            <Option :value="20">20</Option>
          </Select>
        </FormItem>
        <FormItem label="数字的个数">
          <Slider show-tip="always" style="width: 100px;" v-model="configModal.numberModel.count" :min="2" :max="5"></Slider>
        </FormItem>
        <FormItem label="单个数字最大值">
          <Slider show-tip="always" style="width: 100px;" v-model="configModal.numberModel.max" :min="10" :max="30"></Slider>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import AxiosHelper from '@/assets/lib/AxiosHelper';
export default {
  name: 'math_postures',
  data() {
    return {
      requestPrefixConfig: 'math_postures/config/',
      answer: [],
      configModal: {
        isShow: false,
        signModel: {},
        numberModel: {},
      },
      signModel: {
        add: {
          value: '+',
          content: '加法',
          isInclude: true,
        },
        sub: {
          value: '-',
          content: '减法',
          isInclude: true,
        },
        multiply: {
          value: '*',
          content: '乘法',
          isInclude: true,
        },
        divide: {
          value: '/',
          content: '除法',
          isInclude: false,
        },
      },
      isAnswerModel: false,
      count: 10, //题目的总个数
      isIncludeBrackets: false,
      include_float_number: false,
      max_expression_number: 20,
      numberModel: {
        max: 10,
        count: 2,
      },
    };
  },
  computed: {
    include_sign_info() {
      var result = [];
      for (let key in this.signModel) {
        let sign = this.signModel[key];
        sign.isInclude && result.push(sign.content);
      }
      return result.join('、');
    },
  },
  methods: {
    /**
     * 数据结构导致的痛楚
     */
    close_config_modal() {
      this.configModal.isShow = false;
      this.isIncludeBrackets = this.configModal.isIncludeBrackets;
      this.count = this.configModal.count;
      this.signModel = {...this.configModal.signModel};
      this.numberModel = {...this.configModal.numberModel};
      let config = this.convert_config_for_request();
      this.request_save_config(config);
    },
    edit_config_modal() {
      this.configModal.isShow = true;
      this.configModal.signModel = JSON.parse(JSON.stringify(this.signModel));
      this.configModal.numberModel = {...this.numberModel};
      this.configModal.count = this.count;
      this.configModal.isIncludeBrackets = this.isIncludeBrackets;
    },
    request_save_config(argConfig) {
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefixConfig + '/saveConfig',
        data: argConfig,
      }).then(response => {
        this.$Message.success('保存成功');
      });
    },
    request_get_config() {
      AxiosHelper.request({
        method: 'get',
        url: this.requestPrefixConfig + '/getConfig',
      }).then(response => {
        let data = response.data;
        if (data && JSON.stringify(data) !== '{}') {
          data.signModel.forEach((el, index, arr) => {
            this.signModel[el.key].isInclude = el.isInclude;
          });
          this.numberModel = data.numberModel;
          this.isIncludeBrackets = data.isIncludeBrackets;
          this.count = data.count;
        }
      });
    },
    convert_config_for_request() {
      let data = {
        signModel: [],
      };
      for (let key in this.configModal.signModel) {
        let el = this.configModal.signModel[key];
        data.signModel.push({
          key: key,
          isInclude: el.isInclude,
        });
      }

      data.count = this.configModal.count;
      data.isIncludeBrackets = this.configModal.isIncludeBrackets;
      data.numberModel = {...this.configModal.numberModel};
      return data;
    },
    submit() {
      this.answer.forEach(el => {
        var flag = el.result == el.userResult;
        if (flag) {
          el.isShow = false;
        }
      });
      let index = this.answer.findIndex(el => el.isShow);
      if (index !== -1) {
        this.$refs['input' + index][0].focus();
      }
      if (this.answer.every(el => !el.isShow)) {
        this.$Message.success('全部答对');
        this.isAnswerModel = false;
        this.answer = [];
      }
    },
    change_include_sign(argKey) {
      if (this.get_include_sign().length == 0) {
        this.$nextTick(
          () => (this.configModal.signModel[argKey].isInclude = true)
        );
      }
    },
    toggle_model() {
      this.isAnswerModel = !this.isAnswerModel;
      this.answer = [];
      if (this.isAnswerModel) {
        this.generate_expressions();
        this.$nextTick(() => {
          this.$refs['input0'][0].focus();
        });
      }
    },
    generate_expressions() {
      let current = 0,
        generated = [];
      var max = 16000,
        a = 0;
      while (current < this.count) {
        if (a++ > max) {
          //防止用户配置不够生成指定个数的式子
          break;
        }

        //数字、字符混合的数组 [1,"+",2]
        let oneNumberRank = this.get_one_number_rank(),
          oneSignRank = this.get_one_sign_rank();

        let parseArr = [];
        for (let i = 0; i < oneNumberRank.length - 1; i++) {
          parseArr.push(oneNumberRank[i], oneSignRank[i]);
        }
        parseArr.push(oneNumberRank[oneNumberRank.length - 1]);
        if (this.isIncludeBrackets) {
          parseArr = this.add_brackets_for_expression(parseArr);
        }

        //将符合的式子放入answer
        let strNumber = this.format_parse_arr(parseArr);
        let isHave = this.answer.some(el => el.expression === strNumber);
        if (!isHave) {
          let result = this.computed_expression([...parseArr]);
          let isAllow = this.is_allow_result(result);
          if (isAllow) {
            current++;
            this.answer.push({
              expression: strNumber,
              result,
              isShow: true,
            });
          }
        }
      }
    },
    format_parse_arr(parseArr) {
      /**
       * 生成的式子具有一点的格式
       */
      let strNumber = '';
      let i;
      for (i = 0; i < parseArr.length - 1; i++) {
        strNumber += parseArr[i];
        if (parseArr[i] != '(' && parseArr[i + 1] != ')') {
          strNumber += ' ';
        }
      }
      strNumber += parseArr[i];
      return strNumber;
    },
    add_brackets_for_expression(parseArr) {
      //最大放入括号的数量
      let maxNumNrackets = this.get_number_brackets();
      let expression = [...parseArr];

      //随机生成该放入的括号数量
      let numBrackets = Math.floor(Math.random() * (maxNumNrackets + 1));
      if (numBrackets < 1) {
        return parseArr;
      }

      let currentLeft = 0,
        currentRight = 0;
      for (let i = 0; i < expression.length; i++) {
        if (currentLeft != numBrackets || currentRight != numBrackets) {
          let isAdd = Math.random() - 0.5 > 0 ? true : false;
          if (isAdd) {
            let sign;
            if (currentRight == currentLeft) {
              sign = '(';
            } else {
              if (currentLeft > currentRight && currentLeft != numBrackets) {
                Math.random() - 0.5 > 0 ? (sign = '(') : (sign = ')');
              } else {
                sign = ')';
              }
            }

            let flag = true;
            if (sign == ')') {
              let closeLeftBracketsIndex = expression.lastIndexOf('(', i);
              if (i - closeLeftBracketsIndex - 1 <= 2) {
                flag = false;
              } else {
                if (!this.is_sign(expression[i])) {
                  flag = false;
                  if (i == expression.length - 1) {
                    i++;
                    flag = true;
                  }
                }
              }
            } else {
              if (this.is_sign(expression[i])) {
                flag = false;
              }
            }
            if (flag) {
              expression.splice(i, 0, sign);
              if (sign == '(') {
                currentLeft++;
              } else {
                currentRight++;
              }
              i++;
            }
          }
        }

        if (currentLeft != currentRight && i >= expression.length - 1) {
          i = -1;
          expression = [].concat(parseArr);
          currentLeft = 0;
          currentRight = 0;
        }
      }

      return expression;
    },
    is_allow_result(result) {
      //是大于零的有理数
      if (!(!Number.isNaN(result) && result > 0 && result != window.Infinity)) {
        return false;
      }

      if (!this.is_allow_float_number(result)) {
        return false;
      }
      return true;
    },
    is_allow_float_number(result) {
      /*
         *  如果结果是不规则的小数或者小数点个数超过3位  则放弃这个式子 0.1 + 0.2 不等于 0.3 这种  
         */
      let flag = true;
      if ((result + '').includes('.') && !/^\d+\.\d{0,2}$/.test(result)) {
        flag = false;
      }
      return flag;
    },
    deal_brackets(parseArr) {
      if (parseArr.includes('(')) {
        let left = 0,
          right = 0;
        for (let i = 0; i < parseArr.length; i++) {
          if (parseArr[i] == '(') {
            left = i;
          } else if (parseArr[i] == ')') {
            right = i;
            break;
          }
        }
        let arr = parseArr
          .slice(0, left)
          .concat(this.computed_expression(parseArr.slice(left + 1, right)))
          .concat(parseArr.slice(right + 1));
        if (arr.includes('(') || arr.includes(')')) {
          arr = this.deal_brackets(arr);
        }
        return arr;
      } else {
        return parseArr;
      }
    },
    computed_expression(parseArr) {
      parseArr = this.deal_brackets(parseArr);
      if (parseArr == null) {
        return Number.NaN;
      }

      parseArr = this.deal_multiply_divide(parseArr);
      if (parseArr == null) {
        return Number.NaN;
      }

      if (parseArr.length == 1) {
        return parseArr[0];
      }

      //对减法进行运算
      let count = 0;
      for (let i = 0; i < parseArr.length; i += 2) {
        if (parseArr[i - 1] == '-') {
          count -= +parseArr[i];
          if (count < 0) {
            count = window.NaN;
            break;
          }
        } else {
          count += +parseArr[i];
        }
      }

      return count;
    },
    deal_multiply_divide(parseArr) {
      if (
        parseArr.includes(this.signModel.multiply.value) ||
        parseArr.includes(this.signModel.divide.value)
      ) {
        let arr_number = [];
        for (let i = 0; i < parseArr.length; i++) {
          let result;
          if (parseArr[i + 1] === this.signModel.multiply.value) {
            result = parseArr[i] * parseArr[i + 2];
          } else if (parseArr[i + 1] === this.signModel.divide.value) {
            result = parseArr[i] / parseArr[i + 2];
          } else {
            arr_number.push(parseArr[i]);
          }

          if (!this.is_allow_float_number(result)) {
            arr_number = null;
            break;
          }

          if (result) {
            parseArr.splice(i, 3, result);
            i -= 1;
          }
        }
        return arr_number;
      } else {
        return parseArr;
      }
    },
    is_sign(sign) {
      let list = this.get_include_sign();
      return list.includes(sign);
    },
    get_one_number_rank() {
      /**
       * 生成一个由数组组成的数组 [1,8,7]
       */
      let arr = [];
      for (let i = 0; i < this.numberModel.count; i++) {
        arr[i] = Math.floor(Math.random() * (this.numberModel.max + 1));
      }
      return arr;
    },

    get_include_sign() {
      let result = [];
      for (let key in this.signModel) {
        let sign = this.signModel[key];
        if (sign.isInclude) {
          result.push(sign.value);
        }
      }
      return result;
    },
    get_number_brackets() {
      return ((this.numberModel.count - 1) / 2) | 0;
    },
    get_one_sign_rank() {
      /**
       * 生成由运算符号组成的序列  ["+","-"]
       */
      let list = [],
        count = this.numberModel.count - 1,
        singList = this.get_include_sign();
      for (let i = 0; i < count; i++) {
        let pos = (Math.random() * singList.length) | 0;
        list.push(singList[pos]);
      }
      return list;
    },
  },

  mounted() {
    this.request_get_config();
  },
};
</script>
