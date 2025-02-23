# order-frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Abbout gloobal website
原諒我用中文：0
### global_web site 網址
global_website.example.com
需要先把這個網址加進C:\Windows\System32\drivers\etc

### 登入/註冊global user
在global_website.example.com可以選註冊或登入
註冊後會建一個tenant database，在tenat 裡已經加好一個admin user，
接著把tenant.example.com加進C:\Windows\System32\drivers\etc\host
就可以去tenant.example.com 用註冊global user 的email 跟password登入
然後使用者就可以用這支admin user 建自己的菜單(理論上ㄏ)

## Abbout gloobal website
原諒我用中文：0

### **1. Global Website 網址**
需要先把 `global_website.example.com` 加入 `C:\Windows\System32\drivers\etc\hosts`   

### **2. 註冊 & 登入 Global User**
在 `global_website.example.com`你可以註冊或登入  
註冊後會自動建立一個 tenant database，在 tenat 裡已經加好一個 admin user

### **3. Tenant 網址設定**
註冊後先把 `tenant.example.com` 加入 **hosts檔**。  
然後去 `tenant.example.com` 登入，email 跟 password 跟 註冊 global user 的一樣。

### **4. 建立自己的菜單**
登入 tenant 後，使用者可以使用 admin user 來建立自己的菜單（理論上啦QQ )


