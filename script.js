const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const height = document.getElementById("mainCanvas").height;

const DELAY = 10;

const SCALE = 1;

var arraySize = 200;
var arrayMin = 0;
var arrayMax = 400;

var comparisons = 0;
var accesses = 0;

var currentArray = getRandomArray(arraySize, arrayMin, arrayMax);

var rectWidth = (document.getElementById("mainCanvas").width - 100) / arraySize;

var sorting = false;

function displayArray(arr){
	//loop through each array element to draw it
	for(var i = 0; i < arr.length; i++){
		drawRect(50 + rectWidth * i, height - arr[i] * SCALE, "white", arr[i] * SCALE);
	}

	drawText(50, 60, `Comparisons: ${comparisons}`);
	drawText(50, 90, `Array accesses: ${accesses}`);
}

function clearCanvas(){
  	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawRect(x, y, color, h){
	ctx.beginPath();
	ctx.lineWidth = "1";
	ctx.fillStyle = color
	ctx.rect(x, y, rectWidth, h);
	ctx.fill();
}

function drawText(x, y, text){
	ctx.font = "24px Arial";
	ctx.fillText(text, x, y);
}

async function highlightAll(arr){
	clearCanvas();
	displayArray(arr);
	for(var i = 0; i < arr.length; i++){
		drawRect(50 + rectWidth * i, height - arr[i] * SCALE, "green", arr[i] * SCALE);
		await sleep(DELAY);
	}
}

function generateNewArray(){
	arraySize = document.getElementById("arraySizeInput").value;
	arrayMin = document.getElementById("arrayMinInput").value;
	arrayMax = document.getElementById("arrayMaxInput").value;

	comparisons = 0;
	accesses = 0;
    
	rectWidth = (document.getElementById("mainCanvas").width - 100) / arraySize;

	currentArray = getRandomArray(arraySize, arrayMin, arrayMax);
	clearCanvas();
	displayArray(currentArray);
}

function sleep(ms) {
  	return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomArray(size, min, max){
  	return Array.from({length: size}, () => Math.floor(Math.random() * (max - min) + min));
}

Array.prototype.swap = function (x,y) {
	var b = this[x];
	this[x] = this[y];
	this[y] = b;
	return this;
}

async function showSwap(arr, x, y){ //shows a swap in array elements by highlighting them in green/red
	clearCanvas();
	displayArray(arr);

	//highlight the two items to be swapped
	drawRect(50 + rectWidth * (x), height - arr[x] * SCALE, "green", arr[x] * SCALE);
	drawRect(50 + rectWidth * (y), height - arr[y] * SCALE, "red", arr[y] * SCALE);

	//swap the items
	arr.swap(x, y);
	accesses += 2;

	//wait a little
	await sleep(DELAY)

	clearCanvas();
	displayArray(arr);

	//redraw them after swap
	drawRect(50 + rectWidth * (x), height - arr[x] * SCALE, "red", arr[x] * SCALE);
	drawRect(50 + rectWidth * (y), height - arr[y] * SCALE, "green", arr[y] * SCALE);
}

async function bubbleSort(arr){
	var swapped;
	do{
		swapped = false;
		for(var i = 1; i < arr.length; i++){
			if(arr[i-1] > arr[i]){
				await showSwap(arr, i-1, i);
				swapped = true;
			}
			accesses += 2;
			comparisons += 2;
		}
	} while(swapped);
	return arr;
}

async function insertionSort(arr){
	var i = 1;
	while(i < arr.length){
		var j = i;
		while(j > 0 && (arr[j-1] > arr[j])){
			await showSwap(arr, j-1, j);
			j--;
			
			comparisons += 2;
			accesses += 2;
		}
		i++;

		comparisons += 1;
	}
	return arr;
}

async function quickSort(arr){ //calls the recursive version of the function
    await quickSortR(arr, 0, arr.length);
	return arr;
}

async function quickSortR(arr, low, high){
    if(low < high){
        p = await partition(arr, low, high);

        await quickSortR(arr, low, p - 1);
        await quickSortR(arr, p + 1, high);
    }

	comparisons += 1;
}

async function partition(arr, low, high){
    var pivot = arr[high]; //pick last element as pivot
    var i = low;

	accesses++;

    for(j = low; j <= high; j++){
        if(arr[j] < pivot){ 
			clearCanvas();
			displayArray(arr);

			//highlight chosen pivot
			drawRect(50 + rectWidth * (high), height - arr[high] * SCALE, "yellow", arr[high]); 

			drawRect(50 + rectWidth * (i), height - arr[i] * SCALE, "red", arr[i] * SCALE);
			drawRect(50 + rectWidth * (j), height - arr[j] * SCALE, "green", arr[j] * SCALE);

			arr.swap(i, j); //swap elements smaller than pivot to the front
			i++;

			accesses += 2;

			await sleep(DELAY);

			clearCanvas();
			displayArray(arr);

			drawRect(50 + rectWidth * (i), height - arr[i] * SCALE, "green", arr[i] * SCALE);
			drawRect(50 + rectWidth * (j), height - arr[j] * SCALE, "red", arr[j] * SCALE);
        }
		comparisons += 2;
		accesses++;
    }
    [arr[i], arr[high]] = [arr[high], arr[i]];
	accesses += 2;

    return i;
}

async function heapSort(arr){
    var n = arr.length;

    //build heap
    for(var i = n/2 - 1; i >= 0; i--){
        await heapify(arr, n, i);
		comparisons++;
    }

    for(var i = n - 1; i > 0; i--){
        arr.swap(0, i); //swap root of heap to the end as it's the biggest element in the array
        n--;

		accesses += 2;

        //ensure new heap is a max heap
        await heapify(arr, n, 0);

		comparisons++;
    }
    return arr;
}

async function heapify(arr, size, i){ //max heapify
    var left = 2 * i + 1; //left of parent node
    var right = 2 * i + 2; //right of parent node

    largest = i;
    if(left < size && arr[left] > arr[largest]){
        largest = left;
    }
    if(right < size && arr[right] > arr[largest]){
        largest = right;
    }

	comparisons += 4;
	accesses += 4;

    if(largest !== i){
        await showSwap(arr, i, largest);
        await heapify(arr, size, largest);
    }
	comparisons += 1;
}

async function mergeSort(arr){
	var n = arr.length;

	var workArr = [...arr];
	//keep merging until the merged array size is bigger than the original array size
	for(width = 1; width < arr.length; width *= 2){
		//merge two subarrays
		for(var i = 0; i < n; i += 2 * width){
			await merge(arr, i, Math.min(i + width, n), Math.min(i + 2 * width, n), workArr);

			comparisons += 3;
		}

		comparisons++;
		//swap arrays
		arr = [...workArr];
	}
	return arr;
}

//left part: arr[left:right-1]
//right part: arr[right:end-1]
async function merge(arr, left, right, end, workArr){
	var i = left;
	var j = right;

	//k is the list indexes for the new merged array
	for(k = left; k < end; k++){
		clearCanvas();
		displayArray(workArr);

		//i is within bounds and arr[i] is less than arr[j] or j out of bounds
		if(i < right && (j >= end || arr[i] <= arr[j])){
			workArr[k] = arr[i];
			accesses += 2;
			i++;
		}
		else{
			workArr[k] = arr[j];
			accesses += 2;
			j++;
		}
		comparisons += 3;
		accesses += 2;
		drawRect(50 + rectWidth * (k), height - arr[k] * SCALE, "green", arr[k] * SCALE);

		await sleep(DELAY);
		clearCanvas();
		displayArray(workArr);
	}

}

//taken from SO
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}