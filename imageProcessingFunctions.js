// useful image processing functions for Canvas imageData
// Author: Sam Redfern, 2014-2016

function sobel(imageData)
{
  //Calculate Gx, Gy for each point

  //If M^2 = Gx^2 + Gy^2 is above threshold and two pixels' M calculated from theta = arctan(Gy/Gx) are maximially different to current pixel M, then mark as edge

  //If pixel is edge, check two pixels along edge, if either not edge and have same direction M^2 is greater than LOWER threshold and maximally differnet to neighbors, then mark as edge
  //Repeat until no added edges
}

function readImage(canvas,filename) {
      var img = new Image();
      img.src = filename;
      img.onload = function() {
         var wid = img.naturalWidth;
         var hgt = img.naturalHeight;
         canvas.width = wid; 
         canvas.height = hgt;
         ctx = canvas.getContext("2d"); // global var
         ctx.drawImage(img,0,0,wid,hgt);
         imgWidth = wid; // global var
         imgHeight = hgt; // global var
      }	
}

function greyscale(imageData) {
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * imageData.width) * 4;
			var grey = Math.round((imageData.data[index+0] + imageData.data[index+1] + imageData.data[index+2])/3);
			imageData.data[index+0] = imageData.data[index+1] = imageData.data[index+2] = grey;
		}
	}
}

function threshold(imageData, level) {
	// assumes image is greyscale (i.e. RGB all the same)
	// so we will only read the Red channel
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * wid) * 4;
			var grey = imageData.data[index+0];
			var output;
			if (grey>=level)
				output=255;
			else
				output=0;
			imageData.data[index+0] = imageData.data[index+1] = imageData.data[index+2] = output;
		}
	}
}

function convolution3x3(imageData,kernel) {
	var kernelWeight = 0;
	for (cell=0;cell<9;cell++)
		kernelWeight+=kernel[cell];
	
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=1;x<wid-1;x++) {
		for (y=1;y<hgt-1;y++) {
			var weightedSum = 0;
			for (xx=-1;xx<=1;xx++) {
				for (yy=-1;yy<=1;yy++) {
					var index = (x+xx + (y+yy)*wid) * 4;
					var grey = imageData.data[index+0];
					var kernelCellIndex = (xx+1 + (yy+1)*3);
					weightedSum += grey*kernel[kernelCellIndex];
				}
			}
			var index = (x + y * wid) * 4;
			var outputGrey = Math.round(weightedSum/kernelWeight);
			outputData[index] = outputGrey; // red channel
			outputData[index+1] = outputGrey; // green channel
			outputData[index+2] = outputGrey; // blue channel
		}
	}

	// copy data from output array to original array
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

function erode(imageData,kernelSize) {
	// assumes image has been thresholded (i.e. colours are all 0 or 255)
	var halfKernelSize = Math.floor(kernelSize/2);
	
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=1;x<wid-halfKernelSize;x++) {
		for (y=1;y<hgt-halfKernelSize;y++) {
			var index = (x + y * wid) * 4;
			if (imageData.data[index]==255) { // this pixel is white so needs to be processed
				erodeOuterLoop:
				for (xx=-halfKernelSize;xx<=halfKernelSize;xx++) {
					for (yy=-halfKernelSize;yy<=halfKernelSize;yy++) {
						var index2 = (x+xx + (y+yy)*wid) * 4;
						if (imageData.data[index2]==0) {
							// pixel at x,y needs to be removed
							outputData[index] = outputData[index+1] = outputData[index+2] = 0;
							break erodeOuterLoop; // exit xx and yy loops
						}
					}
				}
			}
		}
	}

	// copy data from output array to original array
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

function dilate(imageData,kernelSize) {
	// assumes image has been thresholded (i.e. colours are all 0 or 255)
	var halfKernelSize = Math.floor(kernelSize/2);
	
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=1;x<wid-halfKernelSize;x++) {
		for (y=1;y<hgt-halfKernelSize;y++) {
			var index = (x + y * wid) * 4;
			if (imageData.data[index]==0) { // this pixel is black so needs to be processed
				erodeOuterLoop:
				for (xx=-halfKernelSize;xx<=halfKernelSize;xx++) {
					for (yy=-halfKernelSize;yy<=halfKernelSize;yy++) {
						var index2 = (x+xx + (y+yy)*wid) * 4;
						if (imageData.data[index2]==255) {
							// pixel at x,y needs to be added
							outputData[index] = outputData[index+1] = outputData[index+2] = 255;
							break erodeOuterLoop; // exit xx and yy loops
						}
					}
				}
			}
		}
	}

	// copy data from output array to original array
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

function invert(imageData) {
	// assumes image is greyscale (i.e. RGB all the same)
	// so we will only read the Red channel
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * wid) * 4;
			var grey = imageData.data[index];
			if (grey==255)
				grey=0;
			else
				grey=255;
			imageData.data[index] = imageData.data[index+1] = imageData.data[index+2] = grey;
		}
	}
}

function countPixels(imageData,matchValue) {
	// assumes image is greyscale (i.e. RGB all the same)
	// so we will only read the Red channel
	var count=0;
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * wid) * 4;
			if (imageData.data[index]==matchValue)
				count++;
		}
	}
	return count;
}

function thinning(imageData,bCompleteThinning) {
	var wid = imageData.width;
	var hgt = imageData.height;
	// build 2d array containing data for 8 thinning templates (each sized 3x3)
    // 0 means must be black, 1 means must be white,
    // 2 means doesn't matter
	var template = [];
	template[0] = [1,1,1, 2,1,2, 0,0,0];
	template[1] = [2,1,1, 0,1,1, 0,0,2];
	template[2] = [0,2,1, 0,1,1, 0,2,1];
	template[3] = [0,0,2, 0,1,1, 2,1,1];
	template[4] = [0,0,0, 2,1,2, 1,1,1];
	template[5] = [2,0,0, 1,1,0, 1,1,2];
	template[6] = [1,2,0, 1,1,0, 1,2,0];
	template[7] = [1,1,2, 1,1,0, 2,0,0];

	var anyChanged = true;
	do {
		anyChanged = false;
		for (y=2; y<hgt-2; y++) {
			for (x=2; x<wid-2; x++) {
				var index = (x + y * wid) * 4;
				if (imageData.data[index]==255) {
					for (t=0; t<8; t++) {
						var pixChange = true;
						for (xx=-1; xx<=1; xx++) {
							for (yy=-1; yy<=1; yy++) {
								var index2 = ((x+xx) + (y+yy)*wid) * 4;
								var templateval = template[t][xx + 1 + 3 * (yy + 1)];
								if (templateval==1 && imageData.data[index2]<255)
									pixChange = false;
								else if (templateval==0 && imageData.data[index2]>0)
									pixChange = false;
							}	
						}
						if (pixChange) {
							anyChanged = true;
							imageData.data[index] = imageData.data[index+1] = imageData.data[index+2] = 0;
						}
					}
				}
			}
		}
	}
	while (anyChanged && bCompleteThinning);

	return anyChanged;
}

function pruning(imageData, pruneLength, bWithRegrowth) {
	var wid = imageData.width;
	var hgt = imageData.height;

	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	// pass 'pruneLength' times thru the image, removing 'on' pixels that have exactly 1 neighbour 'on'
	for (i=0; i<pruneLength; i++) {
		for (x=1; x<wid-1; x++) {
			for (y=1; y<hgt-1; y++) {
				var index = (x + y * wid) * 4;
				if (outputData[index]==255) {
					var neighbours = 0;
					if (outputData[(x + (y-1) * wid) * 4]>=254)
						neighbours++;
					if (outputData[(x + (y+1) * wid) * 4]>=254)
						neighbours++;
					if (outputData[(x-1 + y * wid) * 4]>=254)
						neighbours++;
					if (outputData[(x+1 + y * wid) * 4]>=254)
						neighbours++;
					if (neighbours==1) {
						// set to 254 so it will still be counted for neighbouring checks on this pass
						outputData[index] = 254; 
					}
				}
			}
		}
		// now remove those that were marked for removal
		for (x=1; x<wid-1; x++) {
			for (y=1; y<hgt-1; y++) {
				var index = (x + y * wid) * 4;
				if (outputData[index]==254)
					outputData[index] = outputData[index+1] = outputData[index+2] = 0;
			}
		}		
	}

	if (bWithRegrowth) {
		// pass 'prunelength' times thru the image, regrowing from 'on' pixels that have exactly 1 neighbour 'on'
		for (i=0; i<pruneLength; i++) {
			for (x=1; x<wid-1; x++) {
				for (y=1; y<hgt-1; y++) {
					var index = (x + y * wid) * 4;
					if (outputData[index]==255) {
						var neighbours = 0;
						if (outputData[(x + (y-1) * wid) * 4]>=254)
							neighbours++;
						if (outputData[(x + (y+1) * wid) * 4]>=254)
							neighbours++;
						if (outputData[(x-1 + y * wid) * 4]>=254)
							neighbours++;
						if (outputData[(x+1 + y * wid) * 4]>=254)
							neighbours++;
						if (neighbours==1) {
							// look for a neighbour that was previously pruned, and replace it (if one is found)
							if (imageData.data[(x + (y-1) * wid) * 4]==255 && outputData[(x + (y-1) * wid) * 4]==0)
								outputData[(x + (y-1) * wid) * 4] = outputData[(x + (y-1) * wid) * 4 + 1] = outputData[(x + (y-1) * wid) * 4 + 2] = 255;
							else if (imageData.data[(x + (y+1) * wid) * 4]==255 && outputData[(x + (y+1) * wid) * 4]==0)
								outputData[(x + (y+1) * wid) * 4] = outputData[(x + (y+1) * wid) * 4 + 1] = outputData[(x + (y+1) * wid) * 4 + 2] = 255;
							else if (imageData.data[(x-1 + y * wid) * 4]==255 && outputData[(x-1 + y * wid) * 4]==0)
								outputData[(x-1 + y * wid) * 4] = outputData[(x-1 + y * wid) * 4 + 1] = outputData[(x-1 + y * wid) * 4 + 2] = 255;
							else if (imageData.data[(x-1 + y * wid) * 4]==255 && outputData[(x-1 + y * wid) * 4]==0)
								outputData[(x+1 + y * wid) * 4] = outputData[(x+1 + y * wid) * 4 + 1] = outputData[(x+1 + y * wid) * 4 + 2] = 255;
						}
					}
				}
			}
		}
	}

	// copy data from output array to original array
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

