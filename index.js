import express from "express";
import fs from "fs"
import path from "path"

const __dirname = path.resolve();
const brands = JSON.parse(fs.readFileSync(path.join(__dirname,"./brands.json"),'utf-8'));


// https://api.upcitemdb.com/prod/trial/lookup?upc=
async function getProductDetails(upc){
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`, {
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9,hi;q=0.8",
          "cache-control": "max-age=0",
          "if-none-match": "W/\"1c0-aW0gV4X8DZcvbFI+rFthLUmPars\"",
          "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "cookie": "_ga=GA1.2.1339832192.1715169257; __gads=ID=8c7e2928733c515a:T=1715169280:RT=1715169280:S=ALNI_MaXUdK1zj9z1crqlrVFP8GzwzhxMw; __gpi=UID=00000e13264c8fc5:T=1715169280:RT=1715169280:S=ALNI_MZUVlWvBZU1DdZtymnzegsEpWoTjg; __eoi=ID=e170ed607044d8b6:T=1715169280:RT=1715169280:S=AA-AfjYAElOM3LMsiBUo73sjiGnE; FCNEC=%5B%5B%22AKsRol-NjV_hI9SZ08J0jg4TwHwpoqDlv9FSj3Jo40XvvBkoqc6Rya14I2TKG9tD4C2YOPD9ouE-fK-KwuRL1Y5wYA0b1aZv-vvSSHU8eMIkLU-kT0zMf6PDwI4WYkRdxM1mRLezlLju9aauloCj3YyWLMhxzUH2ew%3D%3D%22%5D%5D; _gid=GA1.2.201712657.1716542420; _ga_GDFBWHNY51=GS1.2.1716542421.4.0.1716542421.0.0.0"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
      });
   
    const data = await res.json();
    return data;
}

async function checkIsSupport(name,title){
    const productName = name.trim().toLowerCase().replace(/'/g, '');
    const isIsraelProduct = brands.find(product => product.toLowerCase().replace(/'/g, '') === productName);
    if(isIsraelProduct){
        return isIsraelProduct;
    }


    for (let index = 0; index < brands.length; index++) {
        const element = brands[index];
        if(title.toLowerCase().includes(element.toLowerCase()))
        {
            return element
        }
        
    }


    return false;
}

const app = express();


app.get("/api/v1/check/:upc", async (req,res) => {
    try{

    
    const upc = req.params.upc;
    const details = await getProductDetails(upc);
    if(details.code != "OK"){
        return res.json({
            isSupport: false,
            message: `This product is safe to go with.`
        })
    }
    const {brand,title} = details?.items[0];
    const isSupport = await checkIsSupport(brand,title);
    if(isSupport){
       return res.json({
            isSupport: true,
            message: `${brand ? brand :  typeof isSupport == 'string' ? isSupport : ''} brands is associated with or supported by Israel.`
        })
    }
   
    res.json({
        isSupport: false,
        message: `${brand} brands is safe to go with.`
    })
    }catch(err){
        console.log(err.message)
        res.json({
            isSupport: false,
            message: `This product is safe to go with.`
        })
    }
})


app.listen(3000, () => {
    console.log("Server Running on port 3000")
})