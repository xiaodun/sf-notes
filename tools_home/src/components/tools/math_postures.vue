<style lang="less">
.divider {
  color: #9ea7b4;
}

#math_postures_vue {
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
    content: " ";
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
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
      0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.3);
  }

  .list-leave-active {
    overflow: hidden;
    height: 60px;
    transition: all 0.35s linear;
  }

  .list-leave-to {
    // opacity: 0;
    height: 0;
  }
}
</style>
<template>
  <div id="math_postures_vue">
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

            <Button size="small" slot="extra" type="info" @click="configModal.isShow = true" shape="circle" icon="ios-hammer-outline" class="update_config"></Button>
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

          <FormItem :key="item" v-show="answer[index].isShow" v-for="(item ,index ) in expressionsList">
            <span class="expression">{{item}}</span>
            <Input number :key="item" @focus="'focus'+index" :ref="'input'+index" type="text" @on-keydown.enter="submit" v-model="answer[index].user_result" />
          </FormItem>
        </transition-group>
        <FormItem>
          <Button @click="submit" class="submit" size="large" type="primary" v-t="'ti_jiao'"></Button>
        </FormItem>
      </Form>
      <div>

      </div>
    </div>
    <Modal v-model="configModal.isShow" title="修改配置" :mask-closable="false">
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
          <Slider show-tip="always" style="width: 100px;" v-model="numberModel.count" :min="2" :max="5"></Slider>
        </FormItem>
        <FormItem label="单个数字最大值">
          <Slider show-tip="always" style="width: 100px;" v-model="numberModel.max" :min="10" :max="30"></Slider>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  name: "math_postures",
  data() {
    return {
      answer: [],
      configModal: {
        isShow: false,
        signModel: {}
      },
      signModel: {
        add: {
          value: "+",
          content: "加法",
          isInclude: true
        },
        sub: {
          value: "-",
          content: "减法",
          isInclude: true
        },
        multiply: {
          value: "*",
          content: "乘法",
          isInclude: true
        },
        divide: {
          value: "/",
          content: "除法",
          isInclude: false
        }
      },
      isAnswerModel: false,
      expressionsList: [],
      expressionsResultList: [],
      count: 10, //题目的总个数
      isIncludeBrackets: false,
      number_range: 10,
      number_count: 2,
      include_float_number: false,
      max_expression_number: 20,
      numberModel: {
        max: 10,
        count: 2,
        isHasFloat: false
      }
    };
  },
  computed: {
    include_sign_info() {
      var result = [];
      for (let key in this.signModel) {
        let sign = this.signModel[key];
        sign.isInclude && result.push(sign.content);
      }
      return result.join("、");
    }
  },
  methods: {
    submit() {
      this.answer.forEach(el => {
        var flag = el.result == el.user_result;
        if (flag) {
          el.isShow = false;
        }
      });
      let index = this.answer.findIndex(el => el.isShow);
      if (index != -1) {
        this.$refs["input" + index][0].focus();
      }
      if (this.answer.every(el => !el.isShow)) {
        this.$Message.success(i18n.t("quan_bu_da_dui"));
        this.isAnswerModel = false;
        this.expressionsList = [];
      }
    },
    change_include_sign(argKey) {
      if (this.get_include_sign().length == 0) {
        this.$nextTick(() => (this.signModel[argKey].isInclude = true));
      }
    },
    toggle_model() {
      this.isAnswerModel = !this.isAnswerModel;
      this.expressionsList = [];
      if (this.isAnswerModel) {
        this.generate_expressions();
        this.$nextTick(() => {
          // this.$refs['input0'][0].$refs.input.focus();

          for (let i = 0; i < 10; i++) {
            this.$refs["input" + i][0].$refs.input.type = "number";
          }
          this.$refs["input0"][0].focus();
        });
      }
    },
    generate_expressions() {
      let sign_list = this.generate_rank_sign(),
        current = 0;
      console.log(sign_list);
      let array = [],
        arr_map_result = [],
        generated = [];
      var max = 16000,
        a = 0;
      while (current < this.count) {
        if (a++ > max) {
          //防止用户配置不够生成指定个数的式子
          break;
        }
        let one_number_rank = this.get_one_number_rank(),
          one_sign_rank =
            sign_list[Math.floor(Math.random() * sign_list.length)];
        let parse_arr = [];
        for (let i = 0; i < one_number_rank.length - 1; i++) {
          parse_arr.push(one_number_rank[i], one_sign_rank[i]);
        }
        parse_arr.push(one_number_rank[one_number_rank.length - 1]);
        if (this.isIncludeBrackets) {
          parse_arr = this.add_brackets_for_expression(parse_arr);
        }

        let str_number = this.format_parse_arr(parse_arr);
        if (!~generated.indexOf(str_number)) {
          generated.push(str_number);
          let result = this.computed_expression([].concat(parse_arr));
          let isAllow = this.is_allow_result(result);
          if (isAllow) {
            current++;
            array.push(str_number);
            arr_map_result.push(result);
          }
        }
      }
      this.expressionsList = array;
      this.expressionsResultList = arr_map_result;

      this.answer = this.expressionsResultList.map((el, index) => {
        var data = {};
        data.isShow = true;
        data.result = el;
        return data;
      });
    },
    format_parse_arr(parse_arr) {
      let str_number = "";
      let i;
      for (i = 0; i < parse_arr.length - 1; i++) {
        str_number += parse_arr[i];
        if (parse_arr[i] != "(" && parse_arr[i + 1] != ")") {
          str_number += " ";
        }
      }
      str_number += parse_arr[i];
      return str_number;
    },
    add_brackets_for_expression(parse_arr) {
      let max_num_brackets = this.get_number_brackets();
      // let max = 16000,a=0;
      let expression = [].concat(parse_arr);
      if (max_num_brackets > 0) {
        let num_brackets = Math.floor(Math.random() * (max_num_brackets + 1));
        if (num_brackets == 0) {
          return parse_arr;
        }
        let currentLeft = 0,
          currentRight = 0;
        for (let i = 0; i < expression.length; i++) {
          /* if(a++>max){
              console.log(12)
              return;
            }*/
          if (currentLeft != num_brackets || currentRight != num_brackets) {
            let is_add = Math.random() - 0.5 > 0 ? true : false;
            if (is_add) {
              let sign;
              if (currentRight == currentLeft) {
                sign = "(";
              } else {
                if (currentLeft > currentRight && currentLeft != num_brackets) {
                  Math.random() - 0.5 > 0 ? (sign = "(") : (sign = ")");
                } else {
                  sign = ")";
                }
              }

              let flag = true;
              if (sign == ")") {
                let close_left_brackets_ind = expression.lastIndexOf("(", i);
                if (i - close_left_brackets_ind - 1 <= 2) {
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
                if (sign == "(") {
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
            expression = [].concat(parse_arr);
            currentLeft = 0;
            currentRight = 0;
          }
        }
      }

      return expression;
    },
    is_include_with_expression(expression) {
      let sign = this.get_include_sign();
      return sign.some(el => !expression.indexOf(el));
    },
    is_allow_result(result) {
      let flag = false;
      if (!Number.isNaN(result) && result > 0 && result != window.Infinity) {
        flag = true;
      }

      if ((result + "").includes(".") && !/^\d+\.\d{0,2}$/.test(result)) {
        flag = false;
      }
      return flag;
    },
    deal_brackets(parse_arr) {
      let left = 0,
        right = 0;
      for (let i = 0; i < parse_arr.length; i++) {
        if (parse_arr[i] == "(") {
          left = i;
        } else if (parse_arr[i] == ")") {
          right = i;
          break;
        }
      }
      let arr = parse_arr
        .slice(0, left)
        .concat(this.computed_expression(parse_arr.slice(left + 1, right)))
        .concat(parse_arr.slice(right + 1));
      if (arr.includes("(") || arr.includes(")")) {
        arr = this.deal_brackets(arr);
      }
      return arr;
    },
    computed_expression(parse_arr) {
      if (this.isIncludeBrackets) {
        if (parse_arr.includes("(")) {
          parse_arr = this.deal_brackets(parse_arr);
        }
      }
      if (parse_arr == null) {
        return Number.NaN;
      }
      if (this.include_multiply || this.include_divide) {
        parse_arr = this.deal_multiply_divide(parse_arr);
      }

      if (parse_arr == null) {
        return Number.NaN;
      }

      if (parse_arr.length == 1) {
        return parse_arr[0];
      }

      let count = 0;

      for (let i = 0; i < parse_arr.length; i += 2) {
        if (parse_arr[i - 1] == "-") {
          count -= +parse_arr[i];
          if (count < 0) {
            count = window.NaN;
            break;
          }
        } else {
          count += +parse_arr[i];
        }
      }

      return count;
    },
    deal_multiply_divide(parse_arr) {
      let arr_number = [],
        lastNumber_str = "";
      for (let i = 0; i < parse_arr.length; i++) {
        let result;
        if (parse_arr[i + 1] == this.sign_multiply) {
          result = parse_arr[i] * parse_arr[i + 2];
        } else if (parse_arr[i + 1] == this.sign_divide) {
          result = parse_arr[i] / parse_arr[i + 2];
        } else {
          arr_number.push(parse_arr[i]);
        }

        if (
          result &&
          !!~("" + result).indexOf(".") &&
          !/^\d+\.\d{0,2}$/.test(result)
        ) {
          arr_number = null;
          break;
        }

        if (result) {
          parse_arr.splice(i, 3, result);
          i -= 1;
        }
      }
      // console.table(arr_number);
      return arr_number;
    },
    get_parse_number_strArr(expression) {
      expression = expression.replace(/\s+/g, "");
      let arr = [],
        lastNumber_str = "";
      for (let i = 0; i < expression.length; i++) {
        if (this.is_sign(expression.charAt(i))) {
          arr.push(lastNumber_str);
          arr.push(expression.charAt(i));
          lastNumber_str = "";
        } else {
          lastNumber_str += expression.charAt(i);
        }
      }
      arr.push(lastNumber_str);
      return arr;
    },
    is_sign(sign) {
      let sign_arr = [
        this.sign_add,
        this.sign_sub,
        this.sign_multiply,
        this.sign_divide
      ];
      return !!~sign_arr.indexOf(sign);
    },
    get_one_number_rank() {
      let arr = [];
      for (let i = 0; i < this.number_count; i++) {
        arr[i] = Math.floor(Math.random() * (this.number_range + 1));
        if (this.include_float_number) {
        }
      }
      return arr;
    },
    get_include_sign() {
      let result = [];
      for (let key in this.signModel) {
        let sign = this.signModel[key];
        if (sign.isInclude) {
          result.push(sign.content);
        }
      }
      return result;
    },

    get_number_generate_count(rank_sign_length) {
      let number_range = this.include_float_number
        ? this.number * 10
        : this.number;
      let max_num =
        rank_sign_length * Math.pow(number_range, this.number_count);
      if (this.include_brackets) {
      }
      return max_num;
    },
    get_number_brackets() {
      return ((this.number_count - 1) / 2) | 0;
    },
    generate_rank_sign() {
      let sign = this.get_include_sign();
      let current = this.number_count - 1;

      let arr = [];
      let min = "",
        max = "";
      for (let i = 0; i < current; i++) {
        min += 1;
        max += sign.length + 1;
      }

      for (let i = min; i <= max; i++) {
        let str_i = i + "";
        let flag = str_i.split("").some(el => el > sign.length || el == 0);
        if (!flag) {
          arr.push(str_i);
        }
      }
      return arr
        .map(el => el.split(""))
        .map(el => el.map((e, i) => sign[e - 1]));
    }
  },
  mounted() {}
};
</script>
