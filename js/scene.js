(function(){
  const canvas=document.getElementById('hero-canvas');
  if(!canvas || typeof THREE==='undefined') return;

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=window.innerWidth<720;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,1000);
  camera.position.z=34;

  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.7));
  renderer.setSize(innerWidth,innerHeight);

  const rig=new THREE.Group();
  rig.position.set(mobile?5:10,0,0);
  scene.add(rig);

  const count=mobile?55:90, radius=mobile?10.5:12.5, pts=[];
  for(let i=0;i<count;i++){
    const phi=Math.acos(-1+(2*i)/count);
    const theta=Math.sqrt(count*Math.PI)*phi;
    pts.push(new THREE.Vector3(
      radius*Math.cos(theta)*Math.sin(phi),
      radius*Math.sin(theta)*Math.sin(phi),
      radius*Math.cos(phi)
    ));
  }

  const pointGeo=new THREE.BufferGeometry().setFromPoints(pts);
  const pointMat=new THREE.PointsMaterial({color:0xa855f7,size:mobile?.28:.34,transparent:true,opacity:.9});
  rig.add(new THREE.Points(pointGeo,pointMat));

  const verts=[];
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      if(pts[i].distanceTo(pts[j])<4.4){
        verts.push(pts[i].x,pts[i].y,pts[i].z,pts[j].x,pts[j].y,pts[j].z);
      }
    }
  }
  const lineGeo=new THREE.BufferGeometry();
  lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  rig.add(new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({
    color:0x22d3ee,transparent:true,opacity:.18
  })));

  const core=new THREE.Mesh(
    new THREE.IcosahedronGeometry(6,1),
    new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.12})
  );
  rig.add(core);

  const glowGeo=new THREE.BufferGeometry();
  const glowCount=mobile?80:150;
  const glowPos=new Float32Array(glowCount*3);
  for(let i=0;i<glowCount;i++){
    glowPos[i*3]=(Math.random()-.5)*90;
    glowPos[i*3+1]=(Math.random()-.5)*60;
    glowPos[i*3+2]=(Math.random()-.5)*60-20;
  }
  glowGeo.setAttribute('position',new THREE.BufferAttribute(glowPos,3));
  const glowMat=new THREE.PointsMaterial({
    size:1.2,transparent:true,opacity:.22,color:0x22d3ee,
    blending:THREE.AdditiveBlending,depthWrite:false
  });
  const field=new THREE.Points(glowGeo,glowMat);
  scene.add(field);

  let mx=0,my=0;
  window.addEventListener('pointermove',e=>{
    mx=e.clientX/innerWidth-.5;
    my=e.clientY/innerHeight-.5;
  },{passive:true});

  function animate(){
    requestAnimationFrame(animate);
    if(!reduced){
      rig.rotation.y+=.002;
      rig.rotation.y+=(mx*.0015);
      rig.rotation.x+=(my*.25-rig.rotation.x)*.02;
      core.rotation.y-=.0011;
      core.rotation.x+=.0007;
      field.rotation.y+=.0002;
    }
    renderer.render(scene,camera);
  }
  animate();

  window.addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<720?1.25:1.7));
    renderer.setSize(innerWidth,innerHeight);
  });
})();
