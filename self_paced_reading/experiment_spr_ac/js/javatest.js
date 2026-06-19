// Documents/GitHub/AdjunctControl26/self_paced_reading/experiment/js/javatest.js
console.log("hello world");
var my_array = [1, 2, 3, 4, 5];

for (var i = 0; i < my_array.length; i++) {
  console.log(my_array[i]);
}

var random = Math.floor(Math.random() * my_array.length)
console.log("Random element: " + my_array[random]);

function fill_conditions() {
    let conditions = [];
    let i = 0
    groups = [1, 2, 3, 4];
    while (i < 24) {
        conditions.push("condition" + (i + 1));
        i++;
    }
    return conditions;
}
console.log(fill_conditions());