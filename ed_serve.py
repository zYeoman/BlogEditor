#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright © 2019 Yongwen Zhuang <zeoman@163.com>
#
# Distributed under terms of the MIT license.

"""
Serve Editor for Jekyll

"""

import os
from flask import Flask, render_template, request
app = Flask(__name__, template_folder='editor',
            static_folder='editor')
app.config.from_json("config.json")
base = os.path.expanduser(app.config['ROOT']) + '/'


def sorted_dir(folder):
    def getmtime(name):
        path = os.path.join(folder, name)
        return os.path.getmtime(path)

    files = [f for f in os.listdir(folder) if f.endswith(".md")]

    return sorted(files, key=getmtime, reverse=True)


@app.route('/')
def serve_index():
    files = sorted_dir(base)
    return render_template('index.html', text='# Editor', files=files)


@app.route('/<filename>', methods=['POST', 'GET'])
def serve_file(filename=None):
    if request.method == 'POST':
        if request.form.get('action', None) == 'Delete':
            os.remove(base + filename)
            return "Delete Success"
        else:
            if request.form.get('data', None) is not None:
                if request.form.get('action', None) == 'Save' and os.path.exists(base + filename):
                    return "File Exists!"
                with open(base + filename, 'w') as f:
                    f.write(request.form['data'].replace('\r', ''))
                    return "Save Success!"
            return "Save Failure"

    files = sorted_dir(base)
    if filename is not None and filename.endswith('.md'):
        with open(base + filename, 'r') as f:
            return render_template('index.html', text=f.read(), files=files)
    else:
        return ""
