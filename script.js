 var gif_frames = 0;

 var progressWrapper = document.getElementById('progressWrapper');
 var progressText = document.getElementById('progressText');
 var view = document.getElementById('view');
 var drop = document.getElementById('drop');

 document.getElementById('import-gif').addEventListener("change", function(e) {
     var file = e.target.files[0];

     if (/gif$/.test(file.type)) {
         progress('Loadging...');
         loadBuffer(file, function(buf) {
             var gif;
             progress('Parsing...');
             gif = new Gif();
             gif.onparse = function() {
                 progress('Please wait...');
                 setTimeout(function() {
                     buildView(gif, file.name, true);
                     progress();
                 }, 20);
             };
             gif.onerror = function(e) {
                 progress();
                 alert(e);
             };
             gif.onprogress = function(e) {
                 progress('Parsing...' + ((100 * e.loaded / e.total) | 0) + '%');
             };
             gif.parse(buf);
         }, function(e) {
             alert(e);
         }, function(e) {
             progress('Loading...' + ((100 * e.loaded / e.total) | 0) + '%');
         });
     } else {
         alert('"' + file.name + '" not GIF');
     }
 });

 function progress(msg) {
     if (msg) {
         progressWrapper.style.display = 'block';
         progressText.textContent = msg;
     } else {
         progressWrapper.style.display = 'none';
     }
 }

 function loadBuffer(file, onload, onerror, onprogress) {
     var fr;
     fr = new FileReader();
     fr.onload = function() {
         onload(this.result);
     };
     fr.onerror = function() {
         if (onerror) {
             onerror(this.error);
         }
     };
     fr.onprogress = function(e) {
         if (onprogress) {
             onprogress(e);
         }
     };
     fr.readAsArrayBuffer(file);
 }

 function buildView(gif, fname, preRender) {
     var canvas_frame, context, frames;
     var canvas_sprite = new fabric.Canvas('merge');

     canvas_frame = document.createElement('canvas');
     canvas_frame.width = gif.header.width;
     canvas_frame.height = gif.header.height;
     canvas_frame.title = 'w=' + canvas_frame.width + ' h=' + canvas_frame.height;
     context = canvas_frame.getContext('2d');
     frames = gif.createFrameImages(context, preRender, !preRender);
     gif_frames = frames.length;

     frames.forEach(function(frame, i) {
         var canvas_frame;
         canvas_frame = document.createElement('canvas');
         canvas_frame.width = frame.image.width;
         canvas_frame.height = frame.image.height;
         canvas_frame.getContext('2d').putImageData(frame.image, 0, 0);
         canvas_frame.title = 'w=' + frame.image.width + ' h=' + frame.image.height + ' delay=' + frame.delay + ' disposal=' + frame.disposalMethod;

         if (frames.length > 1) {
             img = new fabric.Image.fromURL(canvas_frame.toDataURL(), function(img) {
                 img.set('selectable', false);
                 img.left = img.getWidth() * i;
                 width = img.getWidth() * i + 1;
                 canvas_sprite.setHeight(img.getHeight());
                 canvas_sprite.setWidth(img.getWidth() * (i + 1));
                 canvas_sprite.add(img);
                 canvas_sprite.renderAll();
                 if (i == frames.length - 1) {
                     $("#view").append("<img src=\"" + canvas_sprite.toDataURL('png') + "\">");
                 }
             });
         } else {
             alert("无效的GIF");
         }
     });
 }