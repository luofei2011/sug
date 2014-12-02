### 通用sug组件

你可以在这里看到运行效果: [http://poised-flw.tk/sug/](http://poised-flw.tk/sug/)

### 支持的数据类型

- 单元数组
```javascript
var data1 = {
    list: ['a', 'ab', 'abc', 'abcd', 'bcd', 'aaaa']
}
```

- 多元数组
```javascript
var data2 = {
    list: [{name: 'test', age: 20}, {name: 'test2', age: 14}]
}
```

- 分类数据（单元数组）
```javascript
var data3 = {
    list: {
        "国家": ["中国", "中东", "中亚"],
        "省份": ["中央"],
        "地区": ["中亚"],
        "街道": ["中央大街"]
    }
}
```

- 分类数据（多元数组）
```javascript
var data4 = {
    list: {
        "国家": [{name: '中国', area: 'aisa'},{name: '中东', area: 'aisa'},{name: '中', area: 'aisa'},{name: '中动', area: 'aisa'}],
        "省份": [{name: "中亚", area: 'ss'}],
        "地区": [{name: "中央", area: 'w3r'}],
        "街道": [{name: "中央大街", area: 'w'}]
    }
}
```

### 参数配置说明

- 如果是**多元数组**

```javascript
dataType: 'object' // 需要传递'object'
useField: 'name' // 多元字段中需要用于显示在页面中的字段，其他的字段会统一显示到data-*属性下
smartyFilter: true // 是否开启智能过滤：当候选集和输入值相同时不出sug框
```

### 版本更新状态

2014-12-02 v0.2 支持多种格式的数据列表，还支持分类!!

2014-12-01 v0.1 对数组类型的数据可以直接使用
