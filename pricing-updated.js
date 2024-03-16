const currencyDOM = document.querySelector("[data-currency]");
const priceDOM = document.querySelector("[data-price]");

fetch("https://ipapi.co/json/")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // console.log(data);
    let currency = data.currency;
    /**
     * Main Setup
     */
    let sliderValue = 1;
    let region = "region_1";
    if (currency === "GBP") {
      currency = "GBP";
      currencyDOM.innerHTML = "Â£";
    } else if (currency === "EUR") {
      currency = "EUR";
      currencyDOM.innerHTML = "â‚¬";
    } else {
      currency = "USD";
      currencyDOM.innerHTML = "$";
    }
    //console.log(currency);

    // Define the structure for base prices and decrement values for each region
    const basePrices = {
        region_1: { USD: 289, EUR: 269, GBP: 229, keyDecrease: -10 },
        region_2: { USD: 379, EUR: 349, GBP: 299, keyDecrease: -15 },
        region_3: { USD: 399, EUR: 369, GBP: 309, keyDecrease: -15 },
        region_4: { USD: 579, EUR: 529, GBP: 449, keyDecrease: -20 },
        region_5: { USD: 639, EUR: 589, GBP: 499, keyDecrease: -20 },
    };
    
    const keys = [1, 3, 5, 10, 20, 35, 50, 75, 99]; // Defined keys
  

    const prices = keys.map(key => {
        let values = {};
        Object.entries(basePrices).forEach(([region, priceInfo]) => {
          // Calculate the price decrement based on the key
          const keyIndex = keys.indexOf(key);
          const decrementSteps = keyIndex; // Number of steps from the first key
          const priceDecrease = decrementSteps * priceInfo.keyDecrease;
      
          values[region] = {
            USD: priceInfo.USD + priceDecrease,
            EUR: priceInfo.EUR + priceDecrease,
            GBP: priceInfo.GBP + priceDecrease,
          };
        });
      
        return { key, values };
      });

    function findClosestPriceKey(testNumber) {
      let closest = null;

      for (let price of prices) {
        if (
          price.key <= testNumber &&
          (closest === null || price.key > closest.key)
        ) {
          closest = price;
        }
      }

      return closest;
    }

    class RegionSelector {
      constructor(selectSelector, flagImgSelector) {
        this.selectElement = document.querySelector(selectSelector);
        this.flagImgElement = document.querySelector(flagImgSelector);

        this.bindEvents();
      }

      bindEvents() {
        this.selectElement.addEventListener("change", (event) => {
          this.updateSelectedOption();
          this.updateFlagImage();
        });
      }

      updateSelectedOption() {
        const options = this.selectElement.options;
        for (let option of options) {
          option.removeAttribute("selected");
        }
        const selectedOption =
          this.selectElement.options[this.selectElement.selectedIndex];
        selectedOption.setAttribute("selected", "selected");

        // Optionally, if you need to do something with the data-region attribute:
        region = selectedOption.getAttribute("data-region");
        //console.log("Selected region:", region);

        //console.log(priceDOM);

        changeValue(sliderValue);
      }

      updateFlagImage() {
        const selectedOption =
          this.selectElement.options[this.selectElement.selectedIndex];
        const flagCode = selectedOption.getAttribute("data-flag");
        this.flagImgElement.src = `https://flagcdn.com/16x12/${flagCode.toLowerCase()}.png`;
      }
    }

    // Usage:
    const regionSelector = new RegionSelector(".select_region", ".flag_img");

    /**
     * Slider
     */

    let startValue2 = findClosestPriceKey(sliderValue).values[region][currency];
    const counterDOM = [...document.querySelectorAll(".counter")];

    let isProcessing = false;

    var odometer2 = new Odometer({
      // el tells the odometer script which element should be the odometer
      el: priceDOM,
      // value tells the odometer script what the start value should be
      value: startValue2,
    });
    odometer2.render(startValue2);

    const counters = [...document.querySelectorAll(".counter")];

    let changeValue = (num, status) => {
      //console.log(num);
      odometer2.update(
        findClosestPriceKey(sliderValue).values[region][currency],
      );
      let counter = String(num).padStart(2, "0").split("");

      animateCounter(counters[0], counter[0], status, 1.5);
      animateCounter(counters[1], counter[1], status); // Only apply special handling to the second counter
    };

    function animateCounter(counter, value, status, duration) {
      const nodes = [...counter.querySelectorAll(".node")];
      const digitValue = parseInt(value, 10);
      nodes.forEach((node, index) => {
        const nodeValue = parseInt(node.textContent, 10);
        // Calculate y value based on the new requirements
        let y = calculateYValue(nodeValue, digitValue);
        node.setAttribute("data-y", y);
        // Set the data-opacity attribute based on y value
        let opacity = y === 0 || y === 1 || y === -1 ? 1 : 0;
        node.setAttribute("data-opacity", opacity);
        gsap.to(node, {
          y: y * 100 + "%", // Animate y-position to the target position
          opacity: opacity,
          duration: () => (duration ? duration : (index / 10) * 1 + 0.5),
          ease: "expo.out", // Ease function for smooth animation
          force3D: true,
        });
      });
    }

    function calculateYValue(nodeValue, digitValue) {
      // Find the index difference
      let indexDiff = nodeValue - digitValue;
      // Adjust for cyclic pattern
      if (indexDiff > 5) {
        indexDiff -= 10;
      } else if (indexDiff < -5) {
        indexDiff += 10;
      }
      return indexDiff;
    }

    changeValue(1);

    // CircleSlider class remains the same

    class CircleSlider {
      constructor() {
        this.isDragging = false;
        this.parentElement = document.querySelector(".parent-3");
        this.circle = this.parentElement.querySelector(".circle");
        this.maskCircle = this.parentElement.querySelector("#myMask circle");
        this.dot1 = this.parentElement.querySelector(".circle .dot1");
        this.addEventListeners();
      }

      addEventListeners() {
        const isTouchDevice =
          "ontouchstart" in window || navigator.msMaxTouchPoints;

        if (isTouchDevice) {
          this.circle.addEventListener("touchstart", () => {
            this.isDragging = true;
          });

          this.circle.addEventListener("touchend", () => {
            this.isDragging = false;
          });

          this.circle.addEventListener("touchmove", (e) => this.handleMove(e));
        } else {
          ["mousedown"].forEach((event) =>
            document.querySelector("body").addEventListener(event, () => {
              this.isDragging = true;
            }),
          );

          ["mouseup", "mouseleave"].forEach((event) =>
            document.querySelector("body").addEventListener(event, () => {
              this.isDragging = false;
            }),
          );

          ["mousemove"].forEach((event) =>
            document
              .querySelector("body")
              .addEventListener(event, (e) => this.handleMove(e)),
          );
        }
      }

      handleMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        const center_x =
          this.circle.offsetWidth / 2 +
          this.circle.getBoundingClientRect().left;
        const center_y =
          this.circle.offsetHeight / 2 +
          this.circle.getBoundingClientRect().top +
          window.scrollY;
        const pos_x = touch.pageX;
        const pos_y = touch.pageY;
        const delta_y = center_y - pos_y;
        const delta_x = center_x - pos_x;

        let angle = Math.atan2(delta_y, delta_x) * (180 / Math.PI) - 90;
        if (angle < 0) {
          angle = 360 + angle;
        }
        angle = Math.round(angle);
        this.updateSlider(angle);
      }

      updateSlider(angle) {
        if (angle >= 248 || angle <= 118) {
          this.totalPercent = Math.round(this.calculateTotalPercent(angle));
          let dashOffset = 2800 - 18 * this.totalPercent;
          this.maskCircle.setAttribute(
            "stroke-dashoffset",
            dashOffset.toString(),
          );
          this.dot1.style.transform = `rotate(${angle}deg)`;
          //console.log(angle);

          if (this.totalPercent !== this.oldPercent) {
            console.log(this.totalPercent);
            this.status =
              this.oldPercent > this.totalPercent ? "decreasing" : "increasing";
            sliderValue = Math.max(1, Math.min(99, this.totalPercent));
            changeValue(sliderValue, this.status);
            this.oldPercent = this.totalPercent;
          }
        }
      }

      calculateTotalPercent(angle) {
        let leftPercent, rightPercent;
        if (angle >= 248) {
          let percentage = Math.ceil(
            this.calculatePercentage(-angle, -364, -248),
          );
          leftPercent = percentage / 2;
          rightPercent = 0;
        } else if (angle <= 118) {
          let percentage = Math.ceil(this.calculatePercentage(angle, 118, 0));
          rightPercent = percentage / 2;
          leftPercent = 50;
        }
        return leftPercent + rightPercent;
      }

      calculatePercentage(currentValue, minValue, maxValue) {
        return (1 - (currentValue - minValue) / (maxValue - minValue)) * 100;
      }
    }

    new CircleSlider();
  });