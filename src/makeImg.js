const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// 创建 Canvas
const canvas = createCanvas();
const context = canvas.getContext('2d');

// 加载图像
// loadImage('Front.png').then(image1 => {
//   loadImage('Hatsu.png').then(image2 => {
//     // 设置 Canvas 的宽度为两个图像的宽度之和，高度为最大的图像高度
//     canvas.width = image1.width + image2.width;
//     canvas.height = Math.max(image1.height, image2.height);

//     // 绘制图像到 Canvas
//     context.drawImage(image1, 0, 0);
//     context.drawImage(image2, image1.width, 0);

//     // 将合并后的图像保存为文件
//     const out = fs.createWriteStream('mergedImage.jpg');
//     const stream = canvas.createJPEGStream();
//     stream.pipe(out);
//     out.on('finish', () => console.log('Merged image saved.'));
//   });
// });
const scaleFactor = 0.2; // 50% 缩小

async function loadAndMergeImages(files, bgs, outputFileName) {
    // 加载所有图片
    const images = await Promise.all(files.map(file => loadImage(file)));
    const bgimg = await Promise.all(bgs.map(bg => loadImage(bg)));
  
    // 获取图片的宽度和高度
    const imageWidth = images[0].width*scaleFactor;
    const imageHeight = images[0].height*scaleFactor;
  
    // 设置 Canvas 的宽度为所有图片的宽度之和，高度为图片高度
    canvas.width = imageWidth * images.length;
    canvas.height = imageHeight;

    const scaledWidth = imageWidth * 0.85; 
    const scaledHeight = imageHeight * 0.85; 

    const offsetScaledWidth = imageWidth *0.15*0.5;
    const offsetScaledHeight = imageHeight * 0.15*0.5;
  
    // 循环绘制图片到 Canvas
    let xOffset = 0;
    for (const image of images) {
      // context.drawImage(bgimg[0], xOffset, 0);
    //   context.drawImage(image, xOffset, 0);
      context.drawImage(bgimg[0], xOffset, 0, imageWidth, imageHeight);
      context.drawImage(image, xOffset+offsetScaledWidth, offsetScaledHeight, scaledWidth, scaledHeight);
      xOffset += imageWidth;
    }
  
    // 将拼接后的图像保存为 PNG 文件
    const out = fs.createWriteStream(outputFileName);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    // out.on('finish', () => console.log('Merged image saved.'));
}

function makeImg(g){
    imageFiles = []; // 添加更多文件名
    bg = ['./riichi-mahjong-tiles/Export/Regular/Front.png']; // 添加更多文件名
    inputString = g.replace(/(\d)(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{8})(m|p|s|z)/g, "$1$9$2$9$3$9$4$9$5$9$6$9$7$9$8$9").replace(/(\d?)(\d?)(\d?)(\d?)(\d?)(\d?)(\d)(\d)(m|p|s|z)/g, "$1$9$2$9$3$9$4$9$5$9$6$9$7$9$8$9").replace(/(m|p|s|z)(m|p|s|z)+/g, "$1").replace(/^[^\d]/, "") 

    // 用于存储分割后的结果
    const pairs = [];

    // 每两个字符一组进行分割
    for (let i = 0; i < inputString.length; i += 2) {
        const pair = inputString.slice(i, i + 2);
        imageFiles.push( './riichi-mahjong-tiles/Export/Regular/'+ pair + '.png');
    }
    loadAndMergeImages(imageFiles, bg, 'mergedImage.png');
}

module.exports = {
    makeImg: makeImg
};