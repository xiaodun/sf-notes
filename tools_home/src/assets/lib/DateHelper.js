class Helper {
  constructor (argVanillaDate) {
    this.vanillaDate = argVanillaDate;
    this.MAX_LUNAR_YEAR = 2100;
    this.MIN_LUNAR_YEAR = 1900;
    this.MIN_LUNAR_MONTH = 1;
    this.MIN_LUNAR_DAY = 31;
    //用来计算农历
    this.lunarInfo = [
      0x04bd8,
      0x04ae0,
      0x0a570,
      0x054d5,
      0x0d260,
      0x0d950,
      0x16554,
      0x056a0,
      0x09ad0,
      0x055d2, //1900-1909
      0x04ae0,
      0x0a5b6,
      0x0a4d0,
      0x0d250,
      0x1d255,
      0x0b540,
      0x0d6a0,
      0x0ada2,
      0x095b0,
      0x14977, //1910-1919
      0x04970,
      0x0a4b0,
      0x0b4b5,
      0x06a50,
      0x06d40,
      0x1ab54,
      0x02b60,
      0x09570,
      0x052f2,
      0x04970, //1920-1929
      0x06566,
      0x0d4a0,
      0x0ea50,
      0x06e95,
      0x05ad0,
      0x02b60,
      0x186e3,
      0x092e0,
      0x1c8d7,
      0x0c950, //1930-1939
      0x0d4a0,
      0x1d8a6,
      0x0b550,
      0x056a0,
      0x1a5b4,
      0x025d0,
      0x092d0,
      0x0d2b2,
      0x0a950,
      0x0b557, //1940-1949
      0x06ca0,
      0x0b550,
      0x15355,
      0x04da0,
      0x0a5b0,
      0x14573,
      0x052b0,
      0x0a9a8,
      0x0e950,
      0x06aa0, //1950-1959
      0x0aea6,
      0x0ab50,
      0x04b60,
      0x0aae4,
      0x0a570,
      0x05260,
      0x0f263,
      0x0d950,
      0x05b57,
      0x056a0, //1960-1969
      0x096d0,
      0x04dd5,
      0x04ad0,
      0x0a4d0,
      0x0d4d4,
      0x0d250,
      0x0d558,
      0x0b540,
      0x0b6a0,
      0x195a6, //1970-1979
      0x095b0,
      0x049b0,
      0x0a974,
      0x0a4b0,
      0x0b27a,
      0x06a50,
      0x06d40,
      0x0af46,
      0x0ab60,
      0x09570, //1980-1989
      0x04af5,
      0x04970,
      0x064b0,
      0x074a3,
      0x0ea50,
      0x06b58,
      0x055c0,
      0x0ab60,
      0x096d5,
      0x092e0, //1990-1999
      0x0c960,
      0x0d954,
      0x0d4a0,
      0x0da50,
      0x07552,
      0x056a0,
      0x0abb7,
      0x025d0,
      0x092d0,
      0x0cab5, //2000-2009
      0x0a950,
      0x0b4a0,
      0x0baa4,
      0x0ad50,
      0x055d9,
      0x04ba0,
      0x0a5b0,
      0x15176,
      0x052b0,
      0x0a930, //2010-2019
      0x07954,
      0x06aa0,
      0x0ad50,
      0x05b52,
      0x04b60,
      0x0a6e6,
      0x0a4e0,
      0x0d260,
      0x0ea65,
      0x0d530, //2020-2029
      0x05aa0,
      0x076a3,
      0x096d0,
      0x04afb,
      0x04ad0,
      0x0a4d0,
      0x1d0b6,
      0x0d250,
      0x0d520,
      0x0dd45, //2030-2039
      0x0b5a0,
      0x056d0,
      0x055b2,
      0x049b0,
      0x0a577,
      0x0a4b0,
      0x0aa50,
      0x1b255,
      0x06d20,
      0x0ada0, //2040-2049
      0x14b63,
      0x09370,
      0x049f8,
      0x04970,
      0x064b0,
      0x168a6,
      0x0ea50,
      0x06b20,
      0x1a6c4,
      0x0aae0, //2050-2059
      0x0a2e0,
      0x0d2e3,
      0x0c960,
      0x0d557,
      0x0d4a0,
      0x0da50,
      0x05d55,
      0x056a0,
      0x0a6d0,
      0x055d4, //2060-2069
      0x052d0,
      0x0a9b8,
      0x0a950,
      0x0b4a0,
      0x0b6a6,
      0x0ad50,
      0x055a0,
      0x0aba4,
      0x0a5b0,
      0x052b0, //2070-2079
      0x0b273,
      0x06930,
      0x07337,
      0x06aa0,
      0x0ad50,
      0x14b55,
      0x04b60,
      0x0a570,
      0x054e4,
      0x0d160, //2080-2089
      0x0e968,
      0x0d520,
      0x0daa0,
      0x16aa6,
      0x056d0,
      0x04ae0,
      0x0a9d4,
      0x0a2d0,
      0x0d150,
      0x0f252, //2090-2099
      0x0d520,
    ];

    //节日信息
    this.festivalList = [
      {isLunar: false, month: '1', date: '1', name: '元旦'},
      {isLunar: false, month: '3', date: '8', name: '妇女节'},
      {isLunar: false, month: '3', date: '12', name: '植树节'},
      {
        isLunar: false,
        month: '5',
        date: '1',
        name: '劳动节',
        '2018': {
          holidays: [
            {
              month: 4,
              date: 29,
            },
            {
              month: 4,
              date: 30,
            },
            {
              month: 5,
              date: 1,
            },
          ],
          add: [
            {
              month: 4,
              date: 28,
            },
          ],
        },
      },
      {isLunar: false, month: '5', date: '4', name: '青年节'},
      {isLunar: false, month: '6', date: '1', name: '儿童节'},
      {isLunar: false, month: '7', date: '1', name: '建党节'},
      {isLunar: false, month: '8', date: '1', name: '建军节'},
      {isLunar: false, month: '9', date: '10', name: '教师节'},
      {
        isLunar: false,
        month: '10',
        date: '1',
        name: '国庆节',
        '2018': {
          holidays: [
            {
              month: 10,
              date: 1,
            },
            {
              month: 10,
              date: 2,
            },
            {
              month: 10,
              date: 3,
            },
            {
              month: 10,
              date: 4,
            },
            {
              month: 10,
              date: 5,
            },
            {
              month: 10,
              date: 6,
            },
            {
              month: 10,
              date: 7,
            },
          ],
          add: [
            {
              month: 9,
              date: 29,
            },
            {
              month: 9,
              date: 30,
            },
          ],
        },
      },
      {isLunar: true, month: '1', date: '1', name: '春节'},
      {isLunar: true, month: '1', date: '15', name: '元宵节'},
      {isLunar: true, month: '5', date: '5', name: '端午节'},
      {isLunar: true, month: '7', date: '7', name: '七夕节'},
      {
        isLunar: true,
        month: '8',
        date: '15',
        name: '中秋节',
        '2018': {
          holidays: [
            {
              month: 9,
              date: 22,
            },
            {
              month: 9,
              date: 23,
            },
            {
              month: 9,
              date: 24,
            },
          ],
          add: [],
        },
      },
      {isLunar: true, month: '9', date: '9', name: '重阳节'},
      {isLunar: true, month: '12', date: '8', name: '腊八节'},
    ];

    this.publicHoliday = {
      2018: [
        {
          //start_month 和 start_date 表示该节日最早的活动日期
          month: 8,
          date: 15,
          isLunar: true,
          name: '中秋节',
        },
        {
          month: 10,
          date: 1,
          isLunar: false,
          name: '国庆节',
        },
        {
          month: 5,
          date: 1,
          isLunar: false,
        },
      ],
    };
  }
  get_format_date (argFormat = 'YYYY-MM-dd') {
    let str = argFormat,
      dateElements = this.get_elements (),
      regexpObj = {
        Y: /(Y){1,4}/,
        M: /(M){1,2}/,
        d: /(d){1,2}/,
        H: /(H){1,2}/,
        m: /(m){1,2}/,
        s: /(s){1,2}/,
      };
    for (let key in regexpObj) {
      let regexp = regexpObj[key];
      str = str.replace (regexp, all => {
        switch (key) {
          case 'Y': {
            let val = dateElements.fullYear + '';
            return val.substr (-all.length); //val.length -all.length
          }
          case 'M': {
            let val = dateElements.month;
            return add_zero (all, val);
          }
          case 'd': {
            let val = dateElements.date;
            return add_zero (all, val);
          }
          case 'H': {
            let val = dateElements.hours;
            return add_zero (all, val);
          }
          case 'm': {
            let val = dateElements.minutes;
            return add_zero (all, val);
          }
          case 's': {
            let val = dateElements.seconds;
            return add_zero (all, val);
          }
        }
      });
    }
    function add_zero (origin, target) {
      if (origin.length == 2 && ('' + target).length == 1) {
        return '0' + target;
      }
      return target;
    }
    return str;
  }
  get_elements () {
    let vanillaDate = this.get_vanilla_date ();

    let obj = {
      fullYear: vanillaDate.getFullYear (),
      year: vanillaDate.getYear (),
      date: vanillaDate.getDate (),
      hours: vanillaDate.getHours (),
      minutes: vanillaDate.getMinutes (),
      seconds: vanillaDate.getSeconds (),
      month: vanillaDate.getMonth () + 1,
      day: vanillaDate.getDay (),
      milliseconds: vanillaDate.getMilliseconds (),
    };
    return obj;
  }
  get_vanilla_date () {
    let vanillaDate = this.vanillaDate || new Date ();
    return vanillaDate;
  }
  get_instance () {
    //Date 的传参形式  月份要自动减去1
    let vanillaDate = new Date (...arguments);
    let month = vanillaDate.getMonth ();
    vanillaDate.setMonth (month - 1);
    return new Helper (vanillaDate);
  }
  get_instance_timestamp () {
    //通过时间戳的形式
    let vanillaDate = new Date (...arguments);
    return new Helper (vanillaDate);
  }
  get_hours_alias () {
    //时间的别名
    let dateElements = this.get_elements ();
    if (dateElements.hours >= 3 && dateElements.hours < 6) {
      return '凌晨';
    } else if (dateElements.hours >= 6 && dateElements.hours < 8) {
      return '早晨';
    } else if (dateElements.hours >= 8 && dateElements.hours < 11) {
      return '上午';
    } else if (dateElements.hours >= 11 && dateElements.hours < 13) {
      return '中午';
    } else if (dateElements.hours >= 13 && dateElements.hours < 17) {
      return '下午';
    } else if (dateElements.hours >= 17 && dateElements.hours < 19) {
      return '傍晚';
    } else if (dateElements.hours >= 19 && dateElements.hours < 23) {
      return '晚上';
    } else if (dateElements.hours >= 23 || dateElements.hours < 3) {
      return '深夜';
    }
  }
  get_week_alias (argList) {
    //周的别名
    let list = argList || ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dateElements = this.get_elements ();

    let alias = list[dateElements.day];
    return alias;
  }
  get_previous_day (argNumber = 1) {
    //得到当前日期的前几天
    let vanillaDate = this.get_vanilla_date ();
    let previousVanillaDate = new Date (+vanillaDate - argNumber * 86400000);
    return new Helper (previousVanillaDate);
  }
  turnedLunar () {
    //将公历时间传为农历\
    let get_lunar_countday = year => {
      var i, sum = 348;
      for (i = 0x8000; i > 0x8; i >>= 1) {
        sum += this.lunarInfo[year - this.MIN_LUNAR_YEAR] & i ? 1 : 0;
      }
      return sum + get_lunar_leapmonth_countday (year);
    };
    //返回农历y年闰月的天数 若该年没有闰月则返回0
    let get_lunar_leapmonth_countday = year => {
      if (get_lunar_leapmonth (year)) {
        return this.lunarInfo[year - 1900] & 0x10000 ? 30 : 29;
      }
      return 0;
    };
    // 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
    let get_lunar_leapmonth = year => {
      return this.lunarInfo[year - this.MIN_LUNAR_YEAR] & 0xf;
    };
    let get_lunar_notleap_countday = (year, month) => {
      if (month > 12 || month < 1) {
        return -1;
      } //月份参数从1至12，参数错误返回-1
      return this.lunarInfo[year - 1900] & (0x10000 >> month) ? 30 : 29;
    };

    let dateElements = this.get_elements ();
    var offset =
      (Date.UTC (
        dateElements.fullYear,
        dateElements.month - 1,
        dateElements.date
      ) -
        Date.UTC (
          this.MIN_LUNAR_YEAR,
          this.MIN_LUNAR_MONTH - 1,
          this.MIN_LUNAR_DAY
        )) /
      86400000;
    var i, temp;
    for (i = this.MIN_LUNAR_YEAR; i <= this.MAX_LUNAR_YEAR && offset > 0; i++) {
      temp = get_lunar_countday (i);
      offset -= temp;
    }
    if (offset < 0) {
      offset += temp;
      i--;
    }

    //计算农历年

    var year = i;

    var leap = get_lunar_leapmonth (i); //闰哪个月
    var isLeap = false;

    //效验闰月
    for (i = 1; i < 13 && offset > 0; i++) {
      //闰月
      if (leap > 0 && i == leap + 1 && isLeap == false) {
        --i;
        isLeap = true;
        temp = get_lunar_leapmonth_countday (year); //计算农历闰月天数
      } else {
        temp = get_lunar_notleap_countday (year, i); //计算农历普通月天数
      }
      //解除闰月
      if (isLeap == true && i == leap + 1) {
        isLeap = false;
      }
      offset -= temp;
    }

    if (offset == 0 && leap > 0 && i == leap + 1)
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        --i;
      }
    if (offset < 0) {
      offset += temp;
      --i;
    }
    //农历月
    var month = i;
    //农历日
    var date = offset + 1;

    let vanillaDate = new Date (this.vanillaDate);
    vanillaDate.setFullYear (year);
    vanillaDate.setMonth (month - 1);
    vanillaDate.setDate (date);
    return new Helper (vanillaDate);
  }
  get_next_festivallist () {
    let list = [],
      dateElements = this.get_elements (),
      lunarDateElements = this.turnedLunar ().get_elements ();
    this.festivalList.forEach ((festival, index, arr) => {
      if (festival.isLunar) {
      } else {
      }
    });
    return list;
  }
  get_current_festivallist () {
    //当前日期是否位节假日
    let list = [],
      dateElements = this.get_elements (),
      lunarDateElements = this.turnedLunar ().get_elements ();
    this.festivalList.forEach ((festival, index, arr) => {
      let elements = dateElements;
      if (festival.isLunar) {
        elements = lunarDateElements;
      }
      if (elements.month == festival.month && elements.date == festival.date) {
        list.push (festival);
      }
    });
    return list;
  }
  get_holiday_festivallist () {
    //当前日期是否处于法定节假日
    let list = [], dateElements = this.get_elements ();
    this.festivalList.forEach ((festival, index, arr) => {
      let holidayInfo = festival[dateElements.fullYear];
      if (holidayInfo !== undefined) {
        let dayIndex = holidayInfo.holidays.findIndex ((el, index, arr) => {
          if (el.month == dateElements.month && el.date == dateElements.date) {
            return true;
          }
        });
        if (dayIndex !== -1) {
          list.push ({
            index: dayIndex + 1, //假期的第几天
            festival,
          });
        }
      }
    });
    return list;
  }
  get_add_festivallist () {
    //当前日期是否处于加班日
    let list = [], dateElements = this.get_elements ();
    this.festivalList.forEach ((festival, index, arr) => {
      let holidayInfo = festival[dateElements.fullYear];
      if (holidayInfo !== undefined) {
        let dayIndex = holidayInfo.add.findIndex ((el, index, arr) => {
          if (el.month == dateElements.month && el.date == dateElements.date) {
            return true;
          }
        });
        if (dayIndex !== -1) {
          list.push ({
            index: dayIndex + 1, //加班的第几天天
            festival,
          });
        }
      }
    });
    return list;
  }
}

let helper = new Helper ();
export default helper;
