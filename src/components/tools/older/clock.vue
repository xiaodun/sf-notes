<template>
  <div id="clock_vue">
    <!-- 提示 -->
    <Alert type="warning" :closable="true">
      废弃声明
      <div slot="desc">

      遗憾的是这个应用被废弃了,将不会再有更新,也没有试用新的命名规范和封装逻辑,但是其对闹钟操作的探索仍是值得借鉴的 <br>
      同时,它也是移动端开发的一块敲门砖，会在H5开发、混合式开发中得以重现 <br>
      用来听歌也是不错的！ <br>
      主要的问题:在浏览器中运行,在设备长时间待机后会影响闹钟的使用(这一点在开发时也考虑过，当时主要为了锻炼逻辑以及vue等框架的使用) <br>
      已发现的bug有: <br>  
      1.指定间隔时 跨域时间段闹钟不会响 <br>
      2.提醒农历节日还有几天到来时 阴历未转换为对应的公历去判断差多少天
      </div>
    </Alert>
    <!-- 添加闹钟时播放铃声用的 -->
    <audio ref="audioDom">您的浏览器不支持 audio 标签。</audio>
    <!-- 闹钟响的时候  用来播放铃声用的 -->
    <audio ref="quarterBellDom">您的浏览器不支持 audio 标签。</audio>
    <Alert style="width:70%" closable v-if="showPlayingTip">
      当前正在播放:&nbsp;&nbsp;{{currentMusicName}}
      <a type="text" @click="closePlayTip" slot="close">停止播放</a>
    </Alert>
    <header>
      <div class="time_panel sf-shadow-4">
        {{currentTime}}
        <span class="time_area_alias">{{timeAreaAlias}}</span>
      </div>

    </header>
    <main>
      <div class="date_panel">
        {{currentDate}} {{week}}
        <span class="lunar">{{lunarString}}</span>
      </div>
      <div class="able-area" v-if="isShowFestivalNotice">
        <span class="notice" v-text="festivalNotice.next"></span>
        <span class="notice" v-text="festivalNotice.current"></span>
        <span class="notice" v-text="festivalNotice.holiday"></span>
        <span class="notice" v-text="festivalNotice.add"></span>
        <span class="notice" v-text="festivalNotice.nextAdd"></span>
      </div>
      <div class="clock-area">
        <Button @click="add_clock_modal = true">添加闹钟</Button>
      </div>
    </main>

    <Modal :mask-closable="false" v-model="add_clock_modal" title="添加闹钟">
      <div style="height:30px;line-height: 30px;color: #c44c4c;font-size: 14px;text-align: center;margin-bottom: 10px;">{{errorTip}}</div>
      <div slot="footer">
        <Button @click="cancel_add_clock">取消</Button>
        <Button type="primary" @click="save_clock(add_clock_data,0)">保存</Button>
      </div>

      <Form :label-width="80">
        <FormItem label="类型">
          <RadioGroup v-model="add_clock_data.model">
            <Radio label="time">指定时间</Radio>
            <Radio label="space">指定间隔</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="间隔" v-if="add_clock_data.model == 'space'">
          <RadioGroup v-model="add_clock_data.space">
            <Radio :label="10">10分钟</Radio>
            <Radio :label="30">30分钟</Radio>
            <Radio :label="60">1小时</Radio>
          </RadioGroup>
          <Input style="width:40px;margin-right:10px;" @on-blur="spaceChange(add_clock_data)" v-model="add_clock_data.space" />分钟
        </FormItem>
          <FormItem label="固定时间" v-else>
            <Input style="width:40px;margin-right:10px;" v-model="add_clock_data.hour" /> 点
            <Input style="width:40px;margin:0 10px 0 10px;" v-model="add_clock_data.minutes" /> 分
        </FormItem>
            <FormItem label="重复">
              <RadioGroup v-model="add_clock_data.repeat">

                <Radio label="once">仅一次</Radio>
                <Radio label="every_day">循环</Radio>
                <Radio label="use_define">自定义</Radio>
              </RadioGroup>
              <Row>
                <Checkbox v-model="add_clock_data.include_today">包含今天</Checkbox>
              </Row>
              <Row v-show="add_clock_data.repeat == 'every_day'">
                <CheckboxGroup v-model="add_clock_data.espce">
                  <Checkbox label="holiday_festival">跳过法定节假日</Checkbox>
                  <Checkbox label="holiday_double_cease_day">跳过双休日</Checkbox>
                </CheckboxGroup>
              </Row>
              <Row v-show="add_clock_data.repeat == 'use_define'">
                <CheckboxGroup v-model="add_clock_data.use_define">
                  <Checkbox :label="1">周一</Checkbox>
                  <Checkbox :label="2">周二</Checkbox>
                  <Checkbox :label="3">周三</Checkbox>
                  <Checkbox :label="4">周四</Checkbox>
                  <Checkbox :label="5">周五</Checkbox>
                  <Checkbox :label="6">周六</Checkbox>
                  <Checkbox :label="7">周日</Checkbox>
                </CheckboxGroup>
                <CheckboxGroup v-model="add_clock_data.espce">
                  <Checkbox label="holiday_festival">跳过法定节假日</Checkbox>
                  <Checkbox v-show="add_clock_data.repeat != 'use_define'" label="holiday_double_cease_day">跳过双休日</Checkbox>
                </CheckboxGroup>
              </Row>
            </FormItem>
            <FormItem label="铃声">
              <Select @on-change="musicChange(add_clock_data.currentMusicSrc)" style="width:40%;" placeholder="冯提莫 - 佛系少女" v-model="add_clock_data.currentMusicSrc">
                <Option v-for="item in musicData" :key="item.path" :value="item.path" v-text="item.name"></Option>
              </Select>
              <Button v-if="isShowPlayBtn" :loading="playLoading" @click="playMusic(add_clock_data.currentMusicSrc)">试听</Button>
              <Button v-else :loading="playLoading" @click="stopMusic">停止</Button>
            </FormItem>
            <FormItem label="铃声模式">
              <Select ref="rightModelDomAdd" style="width:40%;" v-model="add_clock_data.ring_model" placeholder="关闭闹钟即停止播放">
                <Option value="endWidthClose" v-text="'关闭闹钟即停止播放'"></Option>
                <Option value="endWidthPlayOne" v-text="'关闭闹钟后继续播放'"></Option>
                <Option value="endWidthAllPlayOne" v-text="'关闭闹钟后依次播放铃声'"></Option>
              </Select>
            </FormItem>
            <FormItem label="闹钟名">
              <Input style="width:40%;" type="text" v-model="add_clock_data.clock_name" />
        </FormItem>
              <FormItem label="备注">
                <Input style="width:40%;" type="text" v-model="add_clock_data.remark" />
        </FormItem>
      </Form>
    </Modal>
    <!-- 编辑闹钟 -->
    <Modal title="编辑闹钟" :mask-closabel="true" v-model="close_edit_model">
      <div style="height:30px;line-height: 30px;color: #c44c4c;font-size: 14px;text-align: center;margin-bottom: 10px;">{{errorTip}}</div>
      <div slot="footer">
        <Button @click="cancel_edit_clock">取消</Button>
        <Button type="primary" @click="save_clock(eidt_clock_data,1)">确定</Button>
      </div>

      <Form :label-width="80">
        <FormItem label="间隔" v-if="eidt_clock_data.model == 'space'">
          <RadioGroup v-model="eidt_clock_data.space">
            <Radio :label="10">10分钟</Radio>
            <Radio :label="30">30分钟</Radio>
            <Radio :label="60">1小时</Radio>
          </RadioGroup>
          <Input style="width:40px;margin-right:10px;" @on-blur="spaceChange(eidt_clock_data)" v-model="eidt_clock_data.space" />分钟
        </FormItem>
          <FormItem label="固定时间" v-else>
            <Input style="width:40px;margin-right:10px;" v-model="eidt_clock_data.hour" /> 点
            <Input style="width:40px;margin:0 10px 0 10px;" v-model="eidt_clock_data.minutes" /> 分
        </FormItem>
            <FormItem label="重复">
              <RadioGroup v-model="eidt_clock_data.repeat">

                <Radio label="once">仅一次</Radio>
                <Radio label="every_day">循环</Radio>
                <Radio label="use_define">自定义</Radio>
              </RadioGroup>
              <Row v-if="isShow(eidt_clock_data.createTimestamp)">
                <Checkbox v-model="eidt_clock_data.include_today">包含今天</Checkbox>
              </Row>
              <Row v-show="eidt_clock_data.repeat == 'every_day'">
                <CheckboxGroup v-model="eidt_clock_data.espce">
                  <Checkbox label="holiday_festival">跳过法定节假日</Checkbox>
                  <Checkbox label="holiday_double_cease_day">跳过双休日</Checkbox>
                </CheckboxGroup>
              </Row>
              <Row v-show="eidt_clock_data.repeat == 'use_define'">
                <CheckboxGroup v-model="eidt_clock_data.use_define">
                  <Checkbox :label="1">周一</Checkbox>
                  <Checkbox :label="2">周二</Checkbox>
                  <Checkbox :label="3">周三</Checkbox>
                  <Checkbox :label="4">周四</Checkbox>
                  <Checkbox :label="5">周五</Checkbox>
                  <Checkbox :label="6">周六</Checkbox>
                  <Checkbox :label="7">周日</Checkbox>
                </CheckboxGroup>
                <CheckboxGroup v-model="eidt_clock_data.espce">
                  <Checkbox label="holiday_festival">跳过法定节假日</Checkbox>
                  <Checkbox v-show="eidt_clock_data.repeat != 'use_define'" label="holiday_double_cease_day">跳过双休日</Checkbox>
                </CheckboxGroup>
              </Row>
            </FormItem>
            <FormItem label="铃声">
              <Select @on-change="musicChange(eidt_clock_data.currentMusicSrc)" style="width:40%;" :placeholder="eidt_clock_data.currentMusicName" v-model="eidt_clock_data.currentMusicSrc">
                <Option v-for="item in musicData" :key="item.path" :value="item.path" v-text="item.name"></Option>
              </Select>
              <Button v-if="isShowPlayBtn" :loading="playLoading" @click="playMusic(eidt_clock_data.currentMusicSrc)">试听</Button>
              <Button v-else :loading="playLoading" @click="stopMusic">停止</Button>
            </FormItem>
            <FormItem label="铃声模式">
              <Select ref="rightModelDomEdit" style="width:40%;" v-model="eidt_clock_data.ring_model" :placeholder="eidt_clock_data.rightModelName">
                <Option value="endWidthClose" v-text="'关闭闹钟即停止播放'"></Option>
                <Option value="endWidthPlayOne" v-text="'关闭闹钟后继续播放'"></Option>
                <Option value="endWidthAllPlayOne" v-text="'关闭闹钟后依次播放铃声'"></Option>
              </Select>
            </FormItem>
            <FormItem label="闹钟名">
              <Input style="width:40%;" type="text" v-model="eidt_clock_data.clock_name" />
        </FormItem>
              <FormItem label="备注">
                <Input style="width:40%;" type="text" v-model="eidt_clock_data.remark" />
        </FormItem>
      </Form>
    </Modal>
    <Modal @on-ok="close_clocking_model" class="clocking_model" :mask-closable="false" :closable="false" v-model="clocking_model" title="时间到了">
      {{this.current_clocking_data.remark}}

    </Modal>
    <Card style="margin-top:15px;" :key="item.name" icon="md-alarm" v-for="(item,itemIndex) in sortClockData">
      <p slot="title">
        <Icon type="md-alarm" /> {{item.clock_name}}
      </p>
      <div>
        <p>
          {{item.remark}}
          <div>
            <span>{{item.model == "time"?"指定时间":"指定间隔"}}：</span>
            <span>{{item.model == "time"?item.hour+":"+item.minutes:item.space+"分钟"}}</span>

          </div>
          <div>
            {{item.repeat=='once'?'仅一次':item.repeat=='every_day'?"循环":"自定义："}}
            <span :key="weekIndex" v-for="(weekIndex,index) in item.use_define" v-if="item.repeat=='use_define'">
              {{weekAlias[weekIndex-1]}}{{index == item.use_define.length-1?"":"、"}}
            </span>
          </div>
          <div v-if="add_clock_data.repeat!='once'">
            <p>{{item.espce.length==1?item.espce[0]=='holiday_festival'?'跳过法定节假日':"跳过双休日":""+(item.espce.length==2 ? "跳过法定节假日、跳过双休日":"")}}</p>
          </div>
        </p>
      </div>
      <div slot="extra">
        <a style="margin-right:8px" @click="confirmDeleteClock(itemIndex)">删除</a>
        <Button style="margin-right:8px" @click="edit_clock(item)">编辑</Button>
        <i-Switch @on-change="saveClockMessage" style="margin-right:8px" v-model="item.isOpen"></i-Switch>
      </div>
    </Card>

  </div>
</template>
<script>
import DateHelper from '@/assets/lib/older/DateHelper';
import {UrlHelper} from '@/assets/lib//older/PathHelper';
import Tools from '@/assets/lib/older/Tools';
import axios from 'axios';
export default {
  name: '',
  data() {
    return {
      weekAlias: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      showPlayingTip: false,
      clockList: [],
      errorTip: '',
      clocking_model: false,
      current_clocking_data: {},
      playLoading: false,
      currentMusicName: '',
      isShowPlayBtn: true,
      eidt_clock_data: {},
      close_edit_model: false,
      musicData: [
        {
          name: '短铃声',
          path: '/static/music/b.mp3',
        },
        {
          name: '短铃声c',
          path: '/static/music/c.mp3',
        },
        {
          name: '短铃声d',
          path: '/static/music/d.mp3',
        },
        {
          name: '短铃声e',
          path: '/static/music/e.mp3',
        },

        {
          name: '冯提莫 - 佛系少女',
          path: '/static/music/冯提莫 - 佛系少女.mp3',
        },
        {
          name: '陈一发儿 - 成都',
          path: '/static/music/陈一发儿 - 成都.mp3',
        },
      ],
      festival_notice_value: 3, //指定节日前几点提醒
      currentDate: '',
      currentlunarDate: '',
      currentTime: '',
      timeAreaAlias: '',
      week: '',
      lunarString: '',
      festivalNotice: {
        next: '',
        current: '',
        holiday: '',
        add: '',
        nextAdd: '',
        clock_name: '',
      },
      spaceClockHook: {},
      add_clock_data: this.initialClockModal(),
      add_clock_modal: false,
      isShowFestivalNotice: false,
      clock_queqe: [
        // {
        //   ring_model: "endWidthAllPlayOne",
        //   remark: "测试",
        //   currentMusicSrc: "/static/music/c.mp3"
        // }
      ],
    };
  },
  methods: {
    isShow(timeStamp) {
      //这里的逻辑在检查闹钟是否响起时有用到，可是想来想去，最好的封装方到了下一个版本的想法，因此不进行封装
      let currentDateElements = DateHelper.getElements();
      let createDateElements = DateHelper.getElements(
        true,
        new Date(timeStamp)
      );
      if (
        createDateElements.fullYear == currentDateElements.fullYear &&
        createDateElements.month == currentDateElements.month &&
        createDateElements.date == currentDateElements.date
      ) {
        return true;
      }
      return false;
    },
    edit_clock(item) {
      this.close_edit_model = true;
      this.eidt_clock_data = JSON.parse(JSON.stringify(item));
    },
    cancel_edit_clock() {
      this.close_edit_model = false;
    },
    confirmDeleteClock(index) {
      this.$Modal.confirm({
        title: '删除闹钟',
        content: '你确定删除吗?',
        onOk: () => {
          this.clockList.splice(index, 1);
          this.saveClockMessage();
        },
      });
    },
    initialClockModal() {
      return {
        model: 'time',
        space: 10,
        minutes: '',
        hour: '',
        ring_model: 'endWidthClose',
        currentMusicSrc: '/static/music/冯提莫 - 佛系少女.mp3',
        include_today: true,
        repeat: 'every_day',
        clock_name: '',
        espce: [],
      };
    },
    closePlayTip() {
      this.$refs.quarterBellDom.src = undefined;
    },
    getMusicData(ArgSrc) {
      let src;
      if (ArgSrc.constructor !== 'Object') {
        src = ArgSrc;
      }
      let musicData = this.musicData.find(el => el.path == src);
      return musicData;
    },
    close_clocking_model() {
      if (this.current_clocking_data.ring_model == 'endWidthClose') {
        this.$refs.quarterBellDom.src = undefined;
      } else {
        this.showPlayingTip = true;
        let musicData = this.getMusicData(
          UrlHelper.getUri(this.$refs.quarterBellDom.src)
        );
        this.currentMusicName = musicData.name;
      }
    },
    stopMusic() {
      this.isShowPlayBtn = true;
      this.$refs.audioDom.pause();
    },
    musicChange(src) {
      // if(this.)
      if (!this.$refs.audioDom.paused) {
        this.playMusic(src);
      }
    },
    clockingPlayMusic(src) {
      this.$refs.quarterBellDom.src = src;
      this.$refs.quarterBellDom.load();
    },
    playMusic(src) {
      this.playLoading = true;
      this.$refs.audioDom.src = src;

      this.$refs.audioDom.load();
    },

    spaceChange(data) {
      data.space = (parseInt(data.space) > 0 && parseInt(data.space)) || 10;
    },
    cancel_add_clock() {
      this.add_clock_data = this.initialClockModal();
      this.add_clock_modal = false;
      this.errorTip = '';
    },
    save_clock(data, flag) {
      this.errorTip = '';
      if (data.model == 'time') {
        if (
          !(
            data.hour.trim() != '' &&
            Number.isInteger(+data.hour) &&
            data.hour >= 0 &&
            data.hour <= 24
          )
        ) {
          this.errorTip = '固定时间=>小时格式错误';
          return;
        }
        if (
          !(
            data.minutes.trim() != '' &&
            Number.isInteger(+data.minutes) &&
            data.minutes >= 0 &&
            data.minutes <= 60
          )
        ) {
          this.errorTip = '固定时间=>分钟格式错误';
          return;
        }
      }

      if (data.repeat == 'use_define') {
        if (!(data.use_define && data.use_define.length > 0)) {
          this.errorTip = '重复=>自定义周期没有选择';
          return;
        }
      }

      data.currentMusicName = this.musicData.find(
        el => el.path == data.currentMusicSrc
      ).name;

      if (flag == 0) {
        //添加闹钟
        this.add_clock_modal = false;
        if (data.clock_name.trim() == '') {
          data.clock_name = '闹钟' + (this.clockList.length + 1);
        }

        data.isOpen = true;
        data.createTimestamp = +new Date();

        data.rightModelName = this.$refs.rightModelDomAdd.$el.querySelector(
          '.ivu-select-selected-value'
        ).textContent;
        this.clockList.push(data);
        this.add_clock_data = this.initialClockModal();
      } else if (flag == 1) {
        let clockIndex = this.clockList.findIndex(
          el => el.createTimestamp == data.createTimestamp
        );
        this.clockList.splice(clockIndex, 1, data);
        data.rightModelName = this.$refs.rightModelDomEdit.$el.querySelector(
          '.ivu-select-selected-value'
        ).textContent;
        this.close_edit_model = false;
      }
      this.errorTip = '';
      this.saveClockMessage();
    },
    saveClockMessage() {
      window.localStorage.setItem(
        'clock_message',
        JSON.stringify(this.clockList)
      );
    },
    initialNotic(notic, dateElements) {
      this.festivalNotice = {
        next: '',
        current: '',
        holiday: '',
        add: '',
        nextAdd: '',
      };
      //下一个节日
      for (let i = 0; i < notic.nextFestival.length; i++) {
        if (notic.nextFestival[i]) {
          if (i == 0) {
            this.festivalNotice.next = `明天${notic.nextFestival[i][0].name}`;
          } else {
            this.festivalNotice.next = `还有${i}天${
              notic.nextFestival[i][0].name
            }`;
          }
          this.isShowFestivalNotice = true;
          break;
        }
      }

      //当前节日
      this.festivalNotice.current =
        notic.currentFestival[0] &&
        ((this.isShowFestivalNotice = true),
        `今天是${notic.currentFestival[0].name}`);

      //什么节日的法定节假日第几天
      for (let i = 0; i < notic.holidayFestival.length; i++) {
        if (notic.holidayFestival[i]) {
          if (
            dateElements.month == notic.holidayFestival[i][0].end_month &&
            dateElements.date == notic.holidayFestival[i][0].end_date
          ) {
            this.festivalNotice.holiday = `${
              notic.holidayFestival[i][0].name
            }放假最后一天`;
          } else {
            this.festivalNotice.holiday = `${
              notic.holidayFestival[i][0].name
            }放假第${i + 1}天`;
          }
          this.isShowFestivalNotice = true;
        }
      }

      //什么节日的加班日第几天
      for (let i = 0; i < notic.addFestival.length; i++) {
        if (notic.addFestival[i]) {
          let add = notic.addFestival[i][0].add;
          if (add.length > 1) {
            if (
              dateElements.month == add[add.length - 1].month &&
              dateElements.date == add[add.length - 1].date
            ) {
              this.festivalNotice.add = `${
                notic.addFestival[i][0].name
              }补班最后一天`;
            } else {
              this.festivalNotice.add = `${
                notic.addFestival[i][0].name
              }补班第${i + 1}天`;
            }
            this.isShowFestivalNotice = true;
          }
        }
      }

      if (!this.festivalNotice.add) {
        // 两个提醒不应同时出现
        if (notic.nextAddFestival.length > 0) {
          if (notic.nextAddFestival[0].add.length > 1) {
            this.festivalNotice.nextAdd = `明天${
              notic.nextAddFestival[0].name
            }补班`;
            this.isShowFestivalNotice = true;
          }
        }
      }
    },
    getClockMessage() {
      return JSON.parse(window.localStorage.getItem('clock_message')) || [];
    },
  },
  computed: {
    sortClockData() {
      return this.clockList;
    },
  },

  mounted() {
    var _this = this;
    this.clockList = this.getClockMessage();
    this.$refs.audioDom.addEventListener(
      'canplaythrough',
      () => {
        this.playLoading = false;
        this.isShowPlayBtn = false;
        this.$refs.audioDom.play();
      },
      false
    );
    this.$refs.audioDom.addEventListener(
      'ended',
      () => {
        this.isShowPlayBtn = true;

        //在这个方法里写相应的逻辑就可以了
      },
      false
    );

    this.$refs.quarterBellDom.addEventListener(
      'canplaythrough',
      () => {
        this.$refs.quarterBellDom.play();
      },
      false
    );
    this.$refs.quarterBellDom.addEventListener(
      'ended',
      () => {
        //已经播放完的路径
        let src = UrlHelper.getUri(this.$refs.quarterBellDom.src);
        //一开始播放的路径
        let record_src = this.current_clocking_data.currentMusicSrc;
        if (!this.clocking_model) {
          //模态框关闭之后的铃声播放处理

          if (this.current_clocking_data.ring_model == 'endWidthAllPlayOne') {
            //循环播放铃声列表
            let currentIndex = this.musicData.findIndex(el => {
              if (el.path == src) {
                return true;
              }
            });
            let nextMusic;
            if (currentIndex == this.musicData.length - 1) {
              nextMusic = this.musicData[0];
            } else {
              nextMusic = this.musicData[currentIndex + 1];
            }

            this.currentMusicName = nextMusic.name;

            if (nextMusic.path != record_src) {
              this.$refs.quarterBellDom.src = nextMusic.path;
            } else {
              this.showPlayingTip = false;
            }
          } else if (
            this.current_clocking_data.ring_model == 'endWidthPlayOne'
          ) {
            this.showPlayingTip = false;
          }
        } else {
          //未关闭一直播放当前
          this.$refs.quarterBellDom.src = src;
        }
      },
      false
    );
    let testTimeStr = '2018-11-2 17:00';
    var flag = Tools.timeout({
      func: () => {
        // let originalDate = DateHelper.getOriginalDate(testTimeStr);
        let originalDate = DateHelper.getOriginalDate();
        let dateElements = DateHelper.getElements(false, originalDate);
        this.currentTime = DateHelper.getDateFormatString(
          'HH:mm:ss',
          false,
          originalDate
        );
        this.timeAreaAlias = DateHelper.getTimeAreaAlias(originalDate);
        this.week = DateHelper.getWeek(originalDate);
        this.currentDate = DateHelper.getDateFormatString(
          'YYYY-MM-dd',
          false,
          originalDate
        );
        this.lunarString = DateHelper.getDateFormatString(
          'MM-dd',
          true,
          originalDate
        );
        this.initialNotic(
          DateHelper.getFestivalNotice(originalDate),
          dateElements
        );
      },
      immediately: true,
    });

    var lastMintes;
    // 效检闹钟
    Tools.timeout({
      func: () => {
        var currentDateElements = DateHelper.getElements();
        // let currentDateElements = DateHelper.getElements(false,DateHelper.getOriginalDate(testTimeStr));
        //同一分钟检测失效
        if (currentDateElements.minutes == lastMintes) {
          return;
        } else {
          lastMintes = currentDateElements.minutes;
        }
        this.clockList.forEach((el, index, arr) => {
          1;
          if (!el.isOpen) {
            //闹钟已经被关闭
            return;
          }

          let createDateElements = DateHelper.getElements(
            true,
            new Date(el.createTimestamp)
          );
          let isCreateDay = false;
          let rightTime = false;
          if (
            createDateElements.fullYear == currentDateElements.fullYear &&
            createDateElements.month == currentDateElements.month &&
            createDateElements.date == currentDateElements.date
          ) {
            isCreateDay = true;
          }
          //是否包含今天逻辑
          if (!el.include_today && isCreateDay) {
            return;
          }

          //跳过法定节假日 和 双休日
          if (el.repeat != 'once') {
            if (el.espce.includes('holiday_festival')) {
              if (DateHelper.isHolidayFestival()) {
                return;
              }
            }
          }
          //跳过周6和周日
          if (el.repeat == 'every_day') {
            if (el.espce.includes('holiday_double_cease_day')) {
              if (
                currentDateElements.day == 6 ||
                currentDateElements.day == 7
              ) {
                if (!DateHelper.isAddWorkDay()) {
                  return;
                }
              }
            }
          }

          //重复方式为自定义

          if (el.repeat == 'use_define') {
            if (!el.use_define.includes(+currentDateElements.day)) {
              return;
            }
          }

          if (el.model == 'time') {
            if (
              currentDateElements.hours == el.hour &&
              currentDateElements.minutes == el.minutes
            ) {
              rightTime = true;
            }
          } else if (el.model == 'space') {
            let lastRunDateelements = _this.spaceClockHook[el.createTimestamp];
            if (lastRunDateelements == null) {
              //考虑到程序可能被关闭 在开启
              lastRunDateelements = {};
              lastRunDateelements.hour = currentDateElements.hours;
              lastRunDateelements.minutes = currentDateElements.minutes;
              this.spaceClockHook[el.createTimestamp] = lastRunDateelements;
            }
            let spaceMinutes =
              Math.abs(currentDateElements.hours - lastRunDateelements.hour) *
                60 +
              Math.abs(
                currentDateElements.minutes - lastRunDateelements.minutes
              );
            if (spaceMinutes == el.space) {
              lastRunDateelements.hour = currentDateElements.hours;
              lastRunDateelements.minutes = currentDateElements.minutes;
              this.spaceClockHook[el.createTimestamp] = lastRunDateelements;
              rightTime = true;
            }
          }

          if (rightTime) {
            //响铃
            this.clock_queqe.push(el);
            if (el.repeat == 'once') {
              el.isOpen = false;
              // arr[index].isOpen = false
              this.saveClockMessage();
            }
          }
        });
      },
      immediately: true,
      time: 1000,
    });
    //始终检测是否响铃
    Tools.timeout({
      func: () => {
        if (this.clock_queqe.length > 0) {
          if (!this.clocking_model) {
            this.current_clocking_data = this.clock_queqe.shift();
            this.clocking_model = true;
            this.$refs.quarterBellDom.src = undefined;
            this.showPlayingTip = false;
            this.clockingPlayMusic(this.current_clocking_data.currentMusicSrc);
          }
        }
      },
      immediately: true,
    });
  },
};
</script>
<style lang="less">
@import '~@/assets/style/base.less';

#clock_vue {
  width: 85%;
  min-width: 300px;
  max-width: 800px;
  margin: 0 auto;

  header {
    text-align: center;
  }

  .time_panel {
    font-family: Times New Roman;
    font-size: 18px;
    font-weight: 400;

    width: 220px;

    letter-spacing: 1px;

    border-radius: 30px;

.vertical_lineheight(40px);
  }

  .time_area_alias {
    font-size: 14px;

    margin-left: 10px;

    color: #797979;
  }

  .date_panel {
    font-size: 14px;

    margin-top: 26px;
    padding-left: 10px;

    border-left: 5px solid #2d8cf0;
  }

  .lunar {
    font-size: 14px;

    margin-left: 10px;

    letter-spacing: 1px;

    color: #919191;
  }

  .able-area {
    font-size: 14px;

    margin-top: 10px;
    padding-left: 10px;

    letter-spacing: 1px;

    border-left: 5px solid rgb(0, 255, 13);

    .notice {
      margin-left: 4px;
    }
  }

  .clock-area {
    width: 70%;
    margin-top: 15px;
  }
}

.clocking_model {
  .ivu-modal-footer {
    button:nth-child(1) {
      display: none;
    }
  }
}


</style>
