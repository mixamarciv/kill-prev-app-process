/** kill-prev-process-app ******************
 *
 * var kill_old_app = require('kill-prev-process-app');
 * example:
 *    kill_old_app({path:__dirname+'/temp/pid'},start_app);
 * or kill_old_app(__dirname+'/temp/pid',start_app);
 * or kill_old_app(start_app);
 * or kill_old_app(function(){ http.createServer().listen(80); });
 * 
 * @param {Object or String} options
 * @param {Function} fn_callback
 * @api public
 *******************************************/
var path = require('path');
var os = require('os');
var fs = require('fs');


module.exports = function (options,fn_callback) {
    if (!fn_callback) {
        fn_callback = options;
    }
    if (!fn_callback || typeof fn_callback !== 'function' ) {
        fn_callback = function () {};
    }
    if (typeof options.wait ==  'number') {
        var tfn = fn_callback;
        fn_callback = function () {
            console.log('  wait: '+options.wait+'ms');
            setTimeout(tfn,options.wait);
        }
    }

    
    options = options || {};
    if(typeof options === 'string') options = {path:options};
    if(!options.path) options.path = path.join( os.tmpdir(), 'nodejs__kill-prev-app-process/pid');
    
    //console.log("options.path=="+options.path);
    check_directory( options.path, function( err, dir_was_exists){
        if(err) throw(err);
        if(!dir_was_exists){
            return save_new_pid_file( options.path, fn_callback);
        }
        
        fs.readdir( options.path, function( err, list_pids ){
            if (list_pids.length == 0) {
                return save_new_pid_file( options.path, fn_callback );
            }
            var killed_pids = [];
            for(var i=0;i<list_pids.length;i++) {
                var pid = list_pids[i];
                kill_process( pid, function (err) {
                    //if(err) return fn_callback(err);
                    fs.unlink(path.join( options.path, pid ), function(err){
                        //if (err) return fn_callback(err);
                        killed_pids.push(pid);
                        if (killed_pids.length == list_pids.length) {
                            return save_new_pid_file( options.path, fn_callback );
                        }
                    });
                });
            }
        });
    });
    
}

function check_directory(path,fn) {
    fs.exists( path, function (exists) {
        if (!exists) {
            mkdir_path( path, function (err) {
                if (err) {
                    var msg = "can't create path:\n  "+path;
                    console.log(msg);
                    return fn(new Error(msg));
                }
                return fn(null,0);
            });
        }else{
            fs.stat( path, function (err,stat) {
                if (err) return fn(err);
                if (!stat.isDirectory()) {
                    var msg = "path is not directory!:\n  "+path;
                    console.log(msg);
                    return fn(new Error(msg));
                }
                return fn(null,1);
            });
        }
    });
}

function save_new_pid_file ( ppath, fn) {
    var pid = String(process.pid);
    var pidfile = path.join( ppath, pid);
    fs.writeFile( pidfile, (new Date()), fn);
}

function kill_process( pid, fn) {
    var exec = require('child_process').exec;
    var cmd = 'kill '+pid;  //
    if (process.platform == 'win32') {
        cmd = 'taskkill /f /PID '+pid;
    }
    exec(cmd, function (err, stdout, stderr) {
        if (err) {
            console.log("ERROR kill prev app process (pid:"+pid+")");
            return fn(err);
        }
        console.log("kill prev app process (pid:"+pid+")");
        fn();
    });
}

function mkdir_path(path_n,fn){
  fs.exists(path_n,function(exists){
      if(!exists){
	  fs.mkdir(path_n, function(err){
	      if(err){
		if(err.code=="ENOENT"){
		    var parent_dir = path.dirname(path_n);
		    if (parent_dir == path_n) return fn(err);
		    mkdir_path(parent_dir,function(){
			mkdir_path(path_n,fn);
		    });
		}else{
		    return fn(err);
		}
	      }else{
		fn();
	      }
	  });
      }else{
	  fn();
      }
  });
}
