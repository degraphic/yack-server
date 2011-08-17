//
// Copyright (c) 2011 Frédéric Bertolus.
//
// This file is part of Yack.
// Yack is free software: you can redistribute it and/or modify it
// under the terms of the GNU Affero General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// Yack is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for
// more details.
// You should have received a copy of the GNU Affero General Public License along
// with Yack. If not, see http://www.gnu.org/licenses/.
//

yack_taskNextId = 0;

function YackTask(file, listener) {
    
    this.worker_callback = function (e) {
	    var data = e.data;
	    switch (data.cmd) {
	        case 'log':
	            console.log('Task '+this.parent.id +'- '+data.message);
	            break;
	        case 'state':
                console.log('Task '+this.parent.id +'- set state '+data.value);
                this.parent.setState(data.value)
	            break;
	        case 'progress':
	            this.parent.setProgress(data.value)
	            break;
            case 'set_sha':
	            this.parent.file['sha'] = data.value;
	            break;
            case 'set_id':
	            console.log('Task '+this.parent.id +'- set id '+data.value);
                
	            this.parent.setFileId(data.value);
	            break;
	    }       
	}
	
	this.start = function() {
		if(this.running) {
			return
		}
		this.worker = new Worker("/static/scripts/yack_worker_send_file.js");
	    this.worker.addEventListener('message', this.worker_callback, false);
		this.worker.postMessage({'cmd' : 'init'});
		this.worker.postMessage({'cmd' : 'add_file', 'file': this.file});
		this.worker['parent'] = this;
		this.running = true; 
	}
	
	this.pause = function() {
		console.log("task pause")
		this.worker.terminate()
		this.running = false;
		if(this.state == "analysing") {
			this.setProgress(-1);
		}
		this.setState("paused")
		
	} 
	
	this.init = function(file, listener) {
		this.id = yack_taskNextId++;
		this.file = file;
        this.listener = listener;
        this.listener.taskCreated(this)
	}
	
    
	
	this.setState = function(state) {
		this.state = state;
        this.listener.taskStateChanged(this)
	}
	
	this.setProgress = function(progress) {
		this.progress = progress;
        this.listener.taskProgressChanged(this)
	}

	this.setFileId = function(id) {
		this.distantId = id;
        this.listener.taskFileIdChanged(this)
	}

                
	
	this.init(file, listener)
}
