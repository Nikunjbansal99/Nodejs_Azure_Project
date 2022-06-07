const { Console } = require('console');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const imagechecker = require('./imagechecker.js')
const downloadfile = require('./downloadfile.js')
const bodyParser = require("body-parser");
const express = require("express");
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');


const app = express();
app.use(
	bodyParser.urlencoded({
		extended:true
	})
);

var Port  = process.env.PORT|| 8080

app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
});



app.listen(Port, function(){
  console.log("NLP Nodejs App Server is running on Port: 8080 by default");
})
operation = 0;

app.post("/", function(req, res) {
	var instruction = String(req.body.cmd);
	console.log(req.body)
  if (instruction==='StorageAcc'){
    operation = 1;
  }
  else if (instruction==='Container') {
    operation = 2;
  } 
  else if (instruction==='UploadBlob') {
    operation = 3;
  }
  else if (instruction==='ListBlobs') {
    operation = 4;
  } 
  //console.log(operation);

  //var prompt = require('prompt-sync')();
  switch (operation){
    case 1:
      var storagename = req.body.StorageAccName;
      async function fn1() {
        const { error, stdout, stderr } = await exec('New-AzStorageAccount -ResourceGroupName "nikunj_rg" -Name "'+storagename+'" -Location "eastus" -SkuName "Standard_RAGRS" -Kind "StorageV2"',{'shell':'powershell.exe'});

        if (stderr) {
          return {"error": stderr};
        }
        return {"data": stdout};
      };
  
      fn1().then( x => {
        console.log(chalk.green.bold('Storage Account Created'))
        res.sendFile(path.resolve('success.html'));
      }).catch(err=>{
        res.sendFile(path.resolve('error.html'));
        console.log(chalk.red.bold("Invalid Storage Account Name"));
        console.log(err.stderr)
      })
      break;
    
    case 2:
      var storagename = req.body.StorageAccName;
      var containername = req.body.ContainerName;
      async function fn2() {
        const { error,stdout, stderr } = await exec('$StorageAccount = Get-AzStorageAccount -ResourceGroupName "nikunj_rg" -Name "'+storagename+'";$Context = $StorageAccount.Context;New-AzStorageContainer -Name '+containername+' -Context $Context -Permission Blob',{'shell':'powershell.exe'});
        if (stderr) {
          return {"error": stderr};
        }
        return {"data": stdout};
      };
  
      fn2().then( x => {
        console.log(chalk.green.bold('Container Created'))
        res.sendFile(path.resolve('success.html'));
      }).catch(err=>{
        res.sendFile(path.resolve('error.html'));
        console.log(err.stderr)
        console.log(chalk.red.bold("Invalid Name"));
      })
      break;
  
    case 3:
      var storagename = req.body.StorageAccName;
      var containername = req.body.ContainerName;
      var filepath = req.body.filepath;
      
      var fileextension = path.extname(filepath);
      //console.log(filename);

      var isimage = (/\.(gif|jpe?g|jpg|tiff?|png|PNG|webp|bmp)$/i).test(fileextension)
      

      if (!isimage){
        res.sendFile(path.resolve('NotImage.html'));
        console.log(chalk.red.bold("Invalid File Extension"));
      } 
      else {
        imagechecker.imagechecker(filepath,(error,value)=>{
            //console.log("debug")
            console.log(value)
            if (value.adult.isAdultContent == true || value.adult.isRacyContent == true || value.adult.isGoryContent == true){
                console.log(chalk.red.bold('Image contains Adult Content '))
                res.sendFile(path.resolve('ImageContentError.html'));
            }
            else{
                downloadfile.downloadfile(filepath,"download.png",function () { });
                const imagepath = path.join(__dirname, "/download.png");
                const filename = path.basename(imagepath);
                console.log(imagepath)
                console.log(filename)

                fs.writeFileSync('log.txt',JSON.stringify(value))
        
                async function fn3() {
                  const { error,stdout, stderr } = await exec('$StorageAccount = Get-AzStorageAccount -ResourceGroupName "nikunj_rg" -Name "'+ storagename +'";$Context = $StorageAccount.Context;$Blob1HT = @{File = "'+ imagepath +'" ; Container        = "'+ containername +'";Blob             = "'+ filename +'"; Context          = $Context};Set-AzStorageBlobContent @Blob1HT',{'shell':'powershell.exe'});
                  if (stderr) {
                    return {"error": stderr};
                  }
                  return {"data": stdout};
                };
          
                fn3().then( x => {
                  console.log(chalk.green.bold('Image File Uploaded'))
                  
                async function logfn3() {
                  const { error,stdout, stderr } = await exec('$StorageAccount = Get-AzStorageAccount -ResourceGroupName "nikunj_rg" -Name "'+storagename+'";$Context = $StorageAccount.Context;$Blob2HT = @{File = "C:/Users/Asus/OneDrive/Documents/GitHub/nodejs_azure_project/log.txt" ; Container= "'+containername+'";Blob= "log.txt"; Context= $Context};Set-AzStorageBlobContent @Blob2HT',{'shell':'powershell.exe'});
                if (stderr) {
                  return {"error": stderr};
                }
                return {"data": stdout};
                };


                logfn3().then( x => {
                  console.log(chalk.green.bold('Log File Uploaded'))
                
                res.sendFile(path.resolve('success.html'));

                }).catch(err=>{
                res.sendFile(path.resolve('error.html'));
                console.log(err.stderr)
                })
                
                }).catch(err=>{
                res.sendFile(path.resolve('error.html'));
                console.log(err.stderr)
                })
            }
          }
      )}
    
      break;
        
  
    case 4:
      var storagename = req.body.StorageAccName;
      var containername = req.body.ContainerName;
      async function fn4() {
        const { error, stdout, stderr } = await exec('$StorageAccount = Get-AzStorageAccount -ResourceGroupName "nikunj_rg" -Name "'+ storagename +'";$Context = $StorageAccount.Context;Get-AzStorageBlob -Container "'+ containername +'" -Context $Context ',{'shell':'powershell.exe'});
        if (stderr) {
          return {"error": stderr};
        }
        return {"data": stdout};
      };
  
      fn4().then( x => {
        console.log(x)
        res.sendFile(path.resolve('success.html'));
      }).catch(err=>{
        res.sendFile(path.resolve('error.html'));
        console.log(err.stderr)
        console.log(chalk.red.bold("Invalid Input"));
      })
      break;
  }
	}
);

