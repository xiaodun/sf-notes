class DateHelper {
  constructor () {
    this.MIN_NOTICE_DAY = 3;
    this.MIN_NOTICE_ADD_DAY = 1;
    this.MAX_LUNAR_YEAR = 2100;
    this.MIN_LUNAR_YEAR = 1900;
    this.MIN_LUNAR_MONTH = 1;
    this.MIN_LUNAR_DAY = 31;
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

    //农历节日
    this.lunarFestival = [
      {month: '1', date: '1', name: '春节'},
      {month: '1', date: '15', name: '元宵节'},
      {month: '5', date: '5', name: '端午节'},
      {month: '7', date: '7', name: '七夕节'},
      {month: '8', date: '15', name: '中秋节'},
      {month: '9', date: '9', name: '重阳节'},
      {month: '12', date: '8', name: '腊八节'},
    ];
    //公历节日
    this.gregorianFestival = [
      {month: '1', date: '1', name: '元旦'},
      {month: '3', date: '8', name: '妇女节'},
      {month: '3', date: '12', name: '植树节'},
      {month: '5', date: '1', name: '劳动节'},
      {month: '5', date: '4', name: '青年节'},
      {month: '6', date: '1', name: '儿童节'},
      {month: '7', date: '1', name: '建党节'},
      {month: '8', date: '1', name: '建军节'},
      {month: '9', date: '10', name: '教师节'},
      {month: '10', date: '1', name: '国庆节'},
    ];

    this.publicHoliday = {
      2018: [
        {
          //start_month 和 start_date 表示该节日最早的活动日期
          start_month: 9,
          start_date: 22,
          end_month: 9,
          end_date: 24,
          name: '中秋节',
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
        {
          start_month: 9,
          start_date: 29,
          end_month: 10,
          end_date: 7,
          name: '国庆节',
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
        {
          start_month: 4,
          start_date: 28,
          end_month: 5,
          end_date: 1,
          name: '劳动节',
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
      ],
    };
  }
  getElements (allString, argDate) {
    let date = argDate || new Date ();
    let obj = {
      fullYear: date.getFullYear (),
      year: date.getYear (),
      date: date.getDate (),
      hours: date.getHours (),
      minutes: date.getMinutes (),
      seconds: date.getSeconds (),
      month: date.getMonth () + 1,
      day: date.getDay (),
      milliseconds: date.getMilliseconds (),
      original: date,
    };
    if (allString) {
      for (let key in obj) {
        obj[key] = obj[key] + '';
      }
    }
    return obj;
  }
  getTimestamp () {
    return +new Date ();
  }
  getDateFormatString (format = 'YYYY-MM-dd', isLunar = false, originalDate) {
    let perFormat = format;
    let regexps = [/Y{1,4}/, /M{1,2}/, /d{1,2}/, /H{1,2}/, /m{1,2}/, /s{1,2}/];
    let dateElements;
    if (isLunar) {
      dateElements = this.getLunarDate (originalDate, true);
    } else {
      dateElements = this.getElements (true, originalDate);
    }

    function addZero (origin, target) {
      if (origin.length == 2 && target.length == 1) {
        return '0' + target;
      }
      return target;
    }
    regexps.forEach (
      (regexp, index) =>
        (perFormat = perFormat.replace (regexp, function (all) {
          switch (index) {
            case 0: {
              let val = dateElements.fullYear;
              return val.substring (-all.length);
            }
            case 1: {
              let val = dateElements.month;
              return addZero (all, val);
            }
            case 2: {
              let val = dateElements.date;
              return addZero (all, val);
            }
            case 3: {
              let val = dateElements.hours;
              return addZero (all, val);
            }
            case 4: {
              let val = dateElements.minutes;
              return addZero (all, val);
            }
            case 5: {
              let val = dateElements.seconds;
              return addZero (all, val);
            }
          }
        }))
    );
    return perFormat;
  }
  getTimeAreaAlias (originalDate) {
    let dateElements = this.getElements (false, originalDate);

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
  getWeek (originalDate) {
    let array = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    let dateElements = this.getElements (false, originalDate);

    return array[dateElements.day];
  }
  isAllowLunar (dateElements) {
    if (
      dateElements.fullYear < this.MIN_LUNAR_YEAR ||
      dateElements.fullYear > this.MAX_LUNAR_YEAR
    ) {
      return false;
    }
    if (
      dateElements.fullYear == this.MIN_LUNAR_YEAR &&
      dateElements.month == this.MIN_LUNAR_MONTH &&
      dateElements.date < this.MIN_LUNAR_DAY
    ) {
      return false;
    }

    return true;
  }
  getLunarDate (argDate, isAllString) {
    let obj = {};
    let dateElements = this.getElements (false, argDate);
    if (this.isAllowLunar (dateElements)) {
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
      for (
        i = this.MIN_LUNAR_YEAR;
        i <= this.MAX_LUNAR_YEAR && offset > 0;
        i++
      ) {
        temp = this.getLunarCountDay (i);
        offset -= temp;
      }
      if (offset < 0) {
        offset += temp;
        i--;
      }

      //计算农历年

      var year = i;

      var leap = this.getLunarLeapMonth (i); //闰哪个月
      var isLeap = false;

      //效验闰月
      for (i = 1; i < 13 && offset > 0; i++) {
        //闰月
        if (leap > 0 && i == leap + 1 && isLeap == false) {
          --i;
          isLeap = true;
          temp = this.getLunarLeapMonthCountDay (year); //计算农历闰月天数
        } else {
          temp = this.getLunarNotLeapCountDay (year, i); //计算农历普通月天数
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
      var day = offset + 1;
      obj = {fullYear: year, month, date: day};
      if (isAllString) {
        for (let key in obj) {
          obj[key] = obj[key] + '';
        }
      }
      obj.isAllow = true;
    } else {
      obj.isAllow = false;
    }
    return obj;
  }
  getLunarNotLeapCountDay (year, month) {
    if (month > 12 || month < 1) {
      return -1;
    } //月份参数从1至12，参数错误返回-1
    return this.lunarInfo[year - 1900] & (0x10000 >> month) ? 30 : 29;
  }
  getLunarCountDay (year) {
    var i, sum = 348;
    for (i = 0x8000; i > 0x8; i >>= 1) {
      sum += this.lunarInfo[year - this.MIN_LUNAR_YEAR] & i ? 1 : 0;
    }
    return sum + this.getLunarLeapMonthCountDay (year);
  }
  //返回农历y年闰月的天数 若该年没有闰月则返回0
  getLunarLeapMonthCountDay (year) {
    if (this.getLunarLeapMonth (year)) {
      return this.lunarInfo[year - 1900] & 0x10000 ? 30 : 29;
    }
    return 0;
  }
  // 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
  getLunarLeapMonth (year) {
    return this.lunarInfo[year - this.MIN_LUNAR_YEAR] & 0xf;
  }
  getOriginalDate () {
    var date = new Date (...arguments);
    if (arguments.length != 0) {
      //不是获取当前日期
      let month = date.getMonth ();
      date.setMonth (month - 1);
    }
    return date;
  }
  getPreviousDay (originalDate, day = 1) {
    return new Date (+originalDate - day * 86400000);
  }
  isHolidayFestival (originalDate) {
    let festivalNotice = this.getFestivalNotice (originalDate);
    if (festivalNotice.holidayFestival.length > 0) {
      return true;
    }
    return false;
  }
  isAddWorkDay (originalDate = new Date ()) {
    let festivalNotice = this.getFestivalNotice (originalDate);
    if (festivalNotice.addFestival.length > 0) {
      return true;
    }
    return false;
  }
  getNextDay (originalDate, day = 1) {
    return new Date (+originalDate + day * 86400000);
  }
  getFestivalNotice (originalDate) {
    let dh = this;
    let dateElements = this.getElements (false, originalDate),
      lunarDateElements = this.getLunarDate (originalDate);
    let notic = {
      nextFestival: [], //距离什么节日还有多少天
      currentFestival: [], //今天是什么节日
      holidayFestival: [], //什么节日的法定节假日 第几天
      addFestival: [], //什么节目的补班日
      nextAddFestival: [], //明天是什么节日的补班日
    };

    put_notice_nextFestival (
      this.lunarFestival,
      lunarDateElements,
      notic.nextFestival,
      this.MIN_NOTICE_DAY
    );
    put_notice_nextFestival (
      this.gregorianFestival,
      dateElements,
      notic.nextFestival,
      this.MIN_NOTICE_DAY
    );
    put_notice_currentFestival (
      this.lunarFestival,
      lunarDateElements,
      notic.currentFestival
    );
    put_notice_currentFestival (
      this.gregorianFestival,
      dateElements,
      notic.currentFestival
    );
    put_notice_holidayFestival (
      this.publicHoliday,
      dateElements,
      notic.holidayFestival
    );
    put_notice_addFestival (
      this.publicHoliday,
      dateElements,
      notic.addFestival
    );
    put_notice_nextAddFestival (
      this.publicHoliday,
      dateElements,
      notic.nextAddFestival,
      this.MIN_NOTICE_ADD_DAY
    );
    function put_notice_nextAddFestival (
      festival_1,
      dateElements_1,
      notic_1,
      MIN_NOTICE_ADD_DAY
    ) {
      let nextDateElements = dh.getElements (
        false,
        dh.getNextDay (dateElements_1.original, MIN_NOTICE_ADD_DAY)
      );
      if (festival_1[dateElements_1.fullYear]) {
        festival_1[dateElements_1.fullYear].forEach (el => {
          if (el.add[0]) {
            if (
              el.add[0].month == nextDateElements.month &&
              el.add[0].date == nextDateElements.date
            ) {
              notic_1.push (el);
            }
          }
        });
      }
    }
    function put_notice_addFestival (festival_1, dateElements_1, notic_1) {
      if (festival_1[dateElements_1.fullYear]) {
        festival_1[dateElements_1.fullYear].forEach (el => {
          let index = el.add.findIndex (el_1 => {
            if (
              el_1.month == dateElements_1.month &&
              el_1.date == dateElements_1.date
            ) {
              return true;
            }
          });
          if (~index) {
            (notic_1[index] && notic_1[index].push (el)) ||
              (notic_1[index] = []).push (el);
          }
        });
      }
    }
    function put_notice_holidayFestival (festival_1, dateElements_1, notic_1) {
      if (festival_1[dateElements_1.fullYear]) {
        festival_1[dateElements_1.fullYear].forEach (el => {
          let index = el.holidays.findIndex (el_1 => {
            if (
              el_1.month == dateElements_1.month &&
              el_1.date == dateElements_1.date
            ) {
              return true;
            }
          });
          if (~index) {
            (notic_1[index] && notic_1[index].push (el)) ||
              (notic_1[index] = []).push (el);
          }
        });
      }
    }
    function put_notice_currentFestival (festival_1, dateElements_1, notic_1) {
      festival_1.forEach (el => {
        if (
          el.month == dateElements_1.month &&
          el.date == dateElements_1.date
        ) {
          notic_1.push (el);
        }
      });
    }
    function put_notice_nextFestival (
      festival_1,
      dateElements_1,
      notic_1,
      MIN_NOTICE_DAY_1
    ) {
      festival_1.forEach (el => {
        let days = [],
          originalDate_festival = dh.getOriginalDate (
            dateElements_1.fullYear,
            el.month,
            el.date
          );
        for (let i = 1; i <= MIN_NOTICE_DAY_1; i++) {
          days.push (dh.getPreviousDay (originalDate_festival, i));
        }

        let day = days.findIndex (el_1 => {
          let dateElements = dh.getElements (false, el_1);
          if (
            dateElements_1.month == dateElements.month &&
            dateElements_1.date == dateElements.date
          ) {
            return true;
          }
        });

        if (~day) {
          (notic_1[day] && notic_1[day].push (el)) ||
            (notic_1[day] = []).push (el);
        }
      });
    }

    return notic;
  }
}
export default new DateHelper ();
