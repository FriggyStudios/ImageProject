// useful image processing functions for Canvas imageData
// Author: Sam Redfern, 2014-2016

function gaussian(imageData)
{
	var wid = imageData.width;
	var hgt = imageData.height;	
	
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];
	
	var gauss = [];
	gauss[0] = [0.00000067,	0.00002292,	0.00019117,	0.00038771,	0.00019117,	0.00002292,	0.00000067];
	gauss[1] = [0.00002292,	0.00078634,	0.00655965,	0.01330373,	0.00655965,	0.00078633,	0.00002292];
	gauss[2] = [0.00019117,	0.00655965,	0.05472157,	0.11098164,	0.05472157,	0.00655965,	0.00019117];
	gauss[3] = [0.00038771,	0.01330373,	0.11098164,	0.22508352,	0.11098164,	0.01330373,	0.00038771];
	gauss[4] = [0.00019117,	0.00655965,	0.05472157,	0.11098164,	0.05472157,	0.00655965,	0.00019117];
	gauss[5] = [0.00002292,	0.00078633,	0.00655965,	0.01330373,	0.00655965,	0.00078633,	0.00002292];
	gauss[6] = [0.00000067,	0.00002292,	0.00019117,	0.00038771,	0.00019117,	0.00002292,	0.00000067];
	
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var rSum = 0;
			var gSum = 0;
			var bSum = 0;
			for (xx=-3;xx<=3;xx++) {
				for (yy=-3;yy<=3;yy++) {
					if(x+xx >= 0 && x+xx < wid && y+yy >= 0 && y+yy < hgt){
						var index = (x+xx + (y+yy)*wid) * 4;
						rSum += imageData.data[index]*gauss[xx+3][yy+3];
						gSum += imageData.data[index+1]*gauss[xx+3][yy+3];
						bSum += imageData.data[index+2]*gauss[xx+3][yy+3];
					}
				}
			}
			var jindex = (x + y*wid)*4;
			outputData[jindex] = rSum;
			outputData[jindex+1] = gSum;
			outputData[jindex+2] = bSum;
		}
	}
	//Output data
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

function markEdge(outputData,length,theta,wid,mSquared,i,maximalDifference)
{
	var checkPixels = [];
	if(theta <= 22.5 || theta >= 157.5){
		checkPixels[0] = [-1,0];
		checkPixels[1] = [1,0];
	}
	else if(theta > 22.5 && theta <= 67.5){
		checkPixels[0] = [-1,-1];
		checkPixels[1] = [1,1];
	}
	else if(theta > 67.5 && theta < 112.5){
		checkPixels[0] = [0,-1];
		checkPixels[1] = [0,1];
	}
	else //if(theta > 112.5 & theta < 157.5)
	{
		checkPixels[0] = [-1,1];
		checkPixels[1] = [1,-1];
	}
	if(((i+checkPixels[0][0]+checkPixels[0][1]*wid < 0 || i+checkPixels[0][0]+checkPixels[0][1]*wid >= length) | maximalDifference <= (mSquared[i] - mSquared[i+checkPixels[0][0]+checkPixels[0][1]*wid])) &&
		((i+checkPixels[1][0]+checkPixels[1][1]*wid < 0 || i+checkPixels[1][0]+checkPixels[1][1]*wid >= length) | maximalDifference <= (mSquared[i] - mSquared[i+checkPixels[1][0]+checkPixels[1][1]*wid])))
	{
		outputData[i*4]	= outputData[i*4+1] = outputData[i*4+2] = 255;
		return true;
	}
	return false;
}
function sobel(imageData)
{
	var higherThreshold = 100;
	var lowerThreshold = 	higherThreshold/3;
	var maximalDifference = 80;
	var wid = imageData.width;
	var hgt = imageData.height;	
	
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];
	
  //Calculate Gx, Gy
	var Gx = [];
	var Gy = [];
	var mSquared = [];
	var theta = [];
	var xKernel = [];
	xKernel[0] = [-1,0,1];
	xKernel[1] = [-2,0,2];
	xKernel[2] = [-1,0,1];
	var yKernel = [];
	yKernel[0] = [1,2,1];
	yKernel[1] = [0,0,0];
	yKernel[2] = [-1,-2,-1];
	for (x=1;x<wid;x++) {
		for (y=1;y<hgt;y++) {
			var xSum = 0;
			var ySum = 0;
			for (xx=-1;xx<=1;xx++) {
				for (yy=-1;yy<=1;yy++) {
					if(x+xx >= 0 && x+xx < wid && y+yy >= 0 && y+yy < hgt){
						var index = (x+xx + (y+yy)*wid) * 4;
						xSum += imageData.data[index]*xKernel[xx+1][yy+1];
						ySum += imageData.data[index]*yKernel[xx+1][yy+1];
					}
				}
			}
			Gx[x+y*wid]=xSum;
			Gy[x+y*wid]=ySum;
			theta[x+y*wid] = Math.atan(Math.abs(Gy[x+y*wid])/Math.abs(Gx[x+y*wid]));
			mSquared[x+y*wid] = Gx[x+y*wid]*Gx[x+y*wid] + Gy[x+y*wid]*Gy[x+y*wid];
		}
	}
	//All pixels black initially
	for (i=0;i<Gx.length;i++)
		outputData[i*4]	= outputData[i*4+1] = outputData[i*4+2] = 0;
	
  //If M^2 = Gx^2 + Gy^2 is above threshold and two pixels' M calculated from theta = arctan(Gy/Gx) are maximially different to current pixel M, then mark as edge
	for(i = 0; i<Gx.length;i++){
		if(higherThreshold <= mSquared[i]){
			markEdge(outputData,Gx.length,theta[i],wid,mSquared,i,maximalDifference);
		}
	}
  //If pixel is edge, check two pixels along edge, if either not edge and have same direction M^2 is greater than LOWER threshold and maximally different to neighbors, then mark as edge
  //Repeat until no added edges
	var change = true;
	for(var j = 0;j < 200;j++)
	{
		change = false;
		for (i=0;i<Gx.length;i++){
			if(outputData[i*4] == 255){
				var edgePixels = [];
				if(theta[i] <= 22.5 || theta[i] >= 157.5){
				edgePixels[0] = [0,-1];
				edgePixels[1] = [0,1];
				}
				else if(theta[i] > 22.5 && theta[i] <= 67.5){
					edgePixels[0] = [-1,1];
					edgePixels[1] = [1,-1];
				}
				else if(theta[i] > 67.5 && theta[i] < 112.5){
					edgePixels[0] = [-1,0];
					edgePixels[1] = [1,0];
				}
				else //if(theta[i] > 112.5 & theta[i] < 157.5)
				{
					edgePixels[0] = [-1,-1];
					edgePixels[1] = [1,1];
				}
				
				if(i+edgePixels[0][0]+edgePixels[0][1]*wid >= 0 && i+edgePixels[0][0]+edgePixels[0][1]*wid < Gx.length)
				{
					if(lowerThreshold <= mSquared[i+edgePixels[0][0]+edgePixels[0][1]*wid]){
						if(markEdge(outputData,Gx.length,theta[i+edgePixels[0][0]+edgePixels[0][1]*wid],wid,mSquared,i+edgePixels[0][0]+edgePixels[0][1]*wid,maximalDifference/3	))
						{
							change = true;
						}
					}	
				}
				if(i+edgePixels[1][0]+edgePixels[1][1]*wid >= 0 && i+edgePixels[1][0]+edgePixels[1][1]*wid < Gx.length)
				{
					if(lowerThreshold <= mSquared[i+edgePixels[1][0]+edgePixels[1][1]*wid]){
						if(markEdge(outputData,Gx.length,theta[i+edgePixels[1][0]+edgePixels[1][1]*wid],wid,mSquared,i+edgePixels[1][0]+edgePixels[1][1]*wid,maximalDifference/3))
						{
							change = true;
						}
					}	
				}
			}
		}
		if(!change)
		{
			break;
		}
	}
	//Output data
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
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

