<template>
  <div class="loading-bro">
    <input type="text" max="20">
    <canvas id="mycanvas" style="height: 500px; width:500px;" width="500" height="500"></canvas>
    <h1>Loading</h1>
    dashoffset
    <Slider :min="-100" v-model="dashoffset"></Slider>
    dasharray
    <Slider v-model="dasharray" max="1500"></Slider>
    <svg x="0px" y="0px" viewBox="0 0 250 250">
      <circle stroke="red" stroke-width="10" fill="transparent" :stroke-dasharray="dasharray" :stroke-dashoffset="dashoffset" cx="85" cy="85" r="80" />

    </svg>
    <svg x="0px" y="0px" viewBox="0 0 250 250">
      <line stroke="red" stroke-width="10" fill="transparent" :stroke-dasharray="dasharray" :stroke-dashoffset="dashoffset" x1=0 y1=0 x2=100 y=0 />

    </svg>
    <svg id="load" x="0px" y="0px" viewBox="0 0 150 150">
      <circle id="loading-inner" cx="75" cy="75" r="60" />
    </svg>
  </div>
</template>
<script>
import VConsole from "vconsole";
// var vConsole = new VConsole();
export default {
  name: "test_vue",
  data() {
    return {
      dashoffset: 0,
      dasharray: 0
    };
  },
  computed: {},
  methods: {},
  mounted() {
    console.log(
      "%o 江哈斯 %c 是红色de %c 睡觉哦",
      { name: "wx" },
      "color:red",
      "color:green"
    );
    const transactions = [
      {
        id: "7cb1-e041b126-f3b8",
        seller: "WAL0412",
        buyer: "WAL3023",
        price: 203450,
        time: 1539688433
      },
      {
        id: "1d4c-31f8f14b-1571",
        seller: "WAL0452",
        buyer: "WAL3023",
        price: 348299,
        time: 1539688433
      },
      {
        id: "b12c-b3adf58f-809f",
        seller: "WAL0012",
        buyer: "WAL2025",
        price: 59240,
        time: 1539688433
      }
    ];

    console.table(transactions, ["id"]);

    var canvas = document.getElementById("mycanvas");

    var ctx = canvas.getContext("2d");
    var index = 0;

    function draw() {
      index++;
      if (index > 360) {
        index = 0;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(
        250,
        250,
        200,
        (Math.PI / 180) * 270,
        (Math.PI / 180) * (index + 270)
      );
      ctx.strokeStyle = "green";
      ctx.lineWidth = 100;
      ctx.stroke();
    }

    setInterval(function() {
      draw();
    }, 10000 / 360);
  }
};
</script>
<style></style>
