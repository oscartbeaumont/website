---
title: Coding Competition Help Sheet
date: 2018-06-14 20:09:04
---
I am entering with a team into a coding Competition in Australia called [ProgComp](https://www.engineering.unsw.edu.au/computer-science-engineering/courses-programs/high-school-computing/progcomp). These are the notes for my team during the competition.

Things to Note:
* Goal: To solve as many of the set programming tasks as possible in the time.
* We are only allowed one Keyboard, Mouse And Printer. "Multiple screens are allowed"
* No internet access other than ProgComp.

<br/>
<br/>
# Coding Help Notes

## Flow Control
For Loops:
{% code lang:nodejs %}
let testing = ["Hello", "This", "Is", "An", "Array"];

for(var i = 0; i < testing.length; i++) {
  console.log(i); //Index
  console.log(testing[i]); //Value
}
{% endcode %}

While Loop:
{% code lang:nodejs %}
let i = 0;
while (i < 10) {
    text += "The number is " + i;
    i++;
}
{% endcode %}

Array Operations:
{% code lang:nodejs %}
var arr = [1, 2, 3, 4]
str.split("\n"); //Split String To Array at Char
arr.join(" "); //Join Array Elements With Char
arr.reverse(); //Reverses The Elements
arr.push("Add To Array"); //Add Element
arr.splice(2, 0, "Test"); //Add At Index (2) Data ("Test"). DO NOT CHANGE THE 0
{% endcode %}

## Type Conversions & Strings
{% code lang:nodejs %}
parseInt("123456"); //returns 123456
123456.toString(); //returns "123456"
"Hey".toLowerCase(); //returns "hey"
"Hey".toUpperCase(); //returns "HEY"
{% endcode %}

## Math
{% code lang:nodejs %}
Math.PI;            // returns 3.141592653589793
Math.round(4.7);    // returns 5
Math.round(4.4);    // returns 4
Math.pow(8, 2);      // returns 64
Math.sqrt(64);      // returns 8
Math.ceil(4.4);     // returns 5
Math.floor(4.7);    // returns 4
Math.min(0, 150, 30, 20, -8, -200);  // returns -200
Math.max(0, 150, 30, 20, -8, -200);  // returns 150
Math.random();     // returns a random number
+ //Addition
- //Subtract
* //Times
/ //Divide
% //Modulus (Get Remainder)
{% endcode %}

## Comparator's
| == | Equal            |
|----|------------------|
| != | Not Equal        |
| >  | Greater Than     |
| <  | Less Than        |
| >= | Greater Or Equal |
| <= | Less Or Equal    |

## Keyboard Input and File Operations
{% code lang:nodejs %}
//Keyboard Input
var stdin = process.openStdin();
require('tty').setRawMode(true);    

stdin.on('keypress', function (chunk, key) {
  process.stdout.write('Get Chunk: ' + chunk + '\n');
  if (key && key.ctrl && key.name == 'c') process.exit();
});

//Load from File
const fs = require('fs');
fs.writeFile("/tmp/test", "Hey there!", function(err) {
    if(err) { return console.log(err); }
    console.log("The file was saved!");
});
{% endcode %}

## The Danger Zone (Regex)
Regex:
{% code lang:nodejs %}
string.replace(/[.,\/#!$'?%\^&\*;:{}=\-_`~()\ ]/g, ""); //Regex Replace
console.log(/^([a-z0-9]{5,})$/.test('abc1'));
console.log(/^([a-z0-9]{5,})$/.test('abc12'));
{% endcode %}

## Things I Should Never Need
Multiline String:
{% code lang:nodejs %}
input = `Testing
more stuff
even more stuff`
{% endcode %}
