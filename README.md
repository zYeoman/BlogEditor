# BlogEditor

使用[HyperMD](https://laobubu.net/HyperMD)作为编辑器，实际上这里的编辑器就是照着[HyperMD](https://laobubu.net/HyperMD)的DEMO改的。

## Run
修改`config.json`，将`ROOT`地址设置为文章地址，例如`~/blog/_posts`
```bash
FLASK_APP=ed_serve.py flask run --port=10200 --host=0.0.0.0
```

## TODO
* 编辑功能升级
  * 新建文档
  * 元数据处理
  * 各种Hover预览
  * CSS美化
  * 文件列表/TOC侧栏切换
* 编辑插件：JekyllEditor
