/* -----------------
   App state & helpers
   ----------------- */
   const appRoot = document.getElementById('app');

   const appState = {
     tuition: { mode:null, amount:0 },
     dependent: null,
     incomeType: null,       // 'w2' | 'self'
     w2: { mode:'manual', wages:0, withheld:0, uploaded:false },
     soldSecurities: null,   // 'yes' | 'no'
     has1095A: null,         // 'yes' | 'no'
     citizenOrGC: null       // 'yes' | 'no'
   };
   
   const toastEl=document.getElementById('toast'); let toastTimer=null;
   function showToast(msg,v='success',d=3000){
     toastEl.textContent=msg;
     toastEl.className=`toast show ${v}`;
     clearTimeout(toastTimer);
     toastTimer=setTimeout(()=>toastEl.classList.remove('show'),d);
   }
   
   function go(from,to){
     document.getElementById(from).classList.remove('active');
     document.getElementById(to).classList.add('active');
     window.scrollTo({top:appRoot.offsetTop-70,behavior:'smooth'});
   }
   function toggleBtn(btn,on){
     if(on){btn.classList.add('active');btn.disabled=false;}
     else {btn.classList.remove('active');btn.disabled=true;}
   }
   function humanSize(b){
     if(b<1024)return b+' B';
     const u=['KB','MB','GB'];let i=-1;
     do{b/=1024;++i;}while(b>=1024&&i<u.length-1);
     return b.toFixed(1)+' '+u[i];
   }
   function fmtMoney(n){return '$'+Number(Math.max(0,Math.round(n))).toLocaleString();}
   
   /* ---------- Screen 1: Tuition ---------- */
   const optUpload=document.getElementById('optUpload'),
         optManual=document.getElementById('optManual'),
         manualField=document.getElementById('manualField'),
         uploadField=document.getElementById('uploadField'),
         uploadArea=document.getElementById('uploadArea'),
         fileUpload=document.getElementById('fileUpload'),
         continueBtn1=document.getElementById('continueBtn1'),
         tuitionAmount=document.getElementById('tuitionAmount'),
         radios1=document.querySelectorAll('input[name="tuitionOption"]'),
         uploadBtnLabel=document.getElementById('uploadBtnLabel'),
         uploadFileName=document.getElementById('uploadFileName'),
         uploadPrompt=document.getElementById('uploadPrompt'),
         uploadSub=document.getElementById('uploadSub');
   
   function resetOptions1(){
     optUpload.classList.remove('active');optManual.classList.remove('active');
     manualField.style.display="none";uploadField.style.display="none";
   }
   radios1.forEach(r=>{
     r.addEventListener('change',()=>{
       resetOptions1();
       if(r.value==='upload'){optUpload.classList.add('active');uploadField.style.display='block';appState.tuition.mode='upload';}
       if(r.value==='manual'){optManual.classList.add('active');manualField.style.display='block';appState.tuition.mode='manual';}
       validateForm1();
     });
   });
   tuitionAmount.addEventListener('input',()=>{
     appState.tuition.amount=Number(tuitionAmount.value||0);
     validateForm1();
   });
   function validateForm1(){
     const sel=document.querySelector('input[name="tuitionOption"]:checked');
     let v=false;
     if(sel){
       if(sel.value==='upload'&&fileUpload.files.length>0)v=true;
       else if(sel.value==='manual'&&tuitionAmount.value.trim()!=='')v=true;
     }
     toggleBtn(continueBtn1,v);
   }
   function updateUploadUI(){
     if(fileUpload.files&&fileUpload.files.length>0){
       const f=fileUpload.files[0];
       uploadFileName.textContent=`Selected: ${f.name} (${humanSize(f.size)})`;
       uploadFileName.style.display='block';
       uploadBtnLabel.textContent='Replace File';
       uploadPrompt.textContent='File selected — you can replace it anytime';
       uploadSub.textContent='You can replace it anytime.';
     }else{
       uploadFileName.style.display='none';
       uploadBtnLabel.textContent='Choose File';
       uploadPrompt.textContent='Drag & drop or click to upload your 1098-T';
       uploadSub.textContent='PDF/JPG/PNG · up to 10 MB';
     }
   }
   uploadArea.addEventListener('dragover',e=>{e.preventDefault();uploadArea.classList.add('dragover');});
   uploadArea.addEventListener('dragleave',()=>uploadArea.classList.remove('dragover'));
   uploadArea.addEventListener('drop',e=>{
     e.preventDefault();uploadArea.classList.remove('dragover');
     if(e.dataTransfer.files.length>0){try{fileUpload.files=e.dataTransfer.files;}catch(_){ }
       updateUploadUI();validateForm1();
     }
   });
   fileUpload.addEventListener('change',()=>{updateUploadUI();validateForm1();});
   continueBtn1.addEventListener('click',()=>{if(!continueBtn1.classList.contains('active'))return;go('screen1','screen2');});
   
   /* ---------- Screen 2: Dependent ---------- */
   const depYes=document.getElementById('depYes'),
         depNo=document.getElementById('depNo'),
         radios2=document.querySelectorAll('input[name="depOption"]'),
         continueBtn2=document.getElementById('continueBtn2');
   function resetOptions2(){depYes.classList.remove('active');depNo.classList.remove('active');}
   radios2.forEach(r=>{
     r.addEventListener('change',()=>{
       resetOptions2();
       if(r.value==='yes'){depYes.classList.add('active');appState.dependent='yes';}
       if(r.value==='no'){depNo.classList.add('active');appState.dependent='no';}
       toggleBtn(continueBtn2,true);
     });
   });
   toggleBtn(continueBtn2,false);
   continueBtn2.addEventListener('click',()=>{if(!continueBtn2.classList.contains('active'))return;go('screen2','screen3');});
   
   /* ---------- Screen 3: Income Type ---------- */
   const incW2=document.getElementById('incW2'),
         incSelf=document.getElementById('incSelf'),
         radiosInc=document.querySelectorAll('input[name="incType"]'),
         continueBtn3=document.getElementById('continueBtn3');
   function resetOptions3(){incW2.classList.remove('active');incSelf.classList.remove('active');}
   radiosInc.forEach(r=>{
     r.addEventListener('change',()=>{
       resetOptions3();
       if(r.value==='w2'){incW2.classList.add('active');appState.incomeType='w2';}
       if(r.value==='self'){incSelf.classList.add('active');appState.incomeType='self';}
       toggleBtn(continueBtn3,true);
     });
   });
   toggleBtn(continueBtn3,false);
   continueBtn3.addEventListener('click',()=>{
     if(!continueBtn3.classList.contains('active'))return;
     const t=document.querySelector('input[name="incType"]:checked').value;
     if(t==='self'){go('screen3','screenNS');}else{go('screen3','screen4');}
   });
   
   /* ---------- Screen NS: Not supported ---------- */
   const endSessionBtn=document.getElementById('endSession');
   endSessionBtn.classList.add('active');endSessionBtn.disabled=false;
   endSessionBtn.addEventListener('click',()=>go('screenNS','screenEnd'));
   
   /* ---------- Screen 4: W-2 (upload OR manual) ---------- */
   const w4OptUpload = document.getElementById('w4OptUpload');
   const w4OptManual = document.getElementById('w4OptManual');
   const w4ModeRadios = document.querySelectorAll('input[name="w4Mode"]');
   
   const w4UploadBox = document.getElementById('w4UploadBox');
   const w4UploadArea = document.getElementById('w4UploadArea');
   const w4Files = document.getElementById('w4Files');
   const w4UploadPrompt = document.getElementById('w4UploadPrompt');
   const w4UploadSub = document.getElementById('w4UploadSub');
   const w4UploadBtnLabel = document.getElementById('w4UploadBtnLabel');
   const w4UploadSummary = document.getElementById('w4UploadSummary');
   
   const w4ManualBox = document.getElementById('w4ManualBox');
   const w4Wages = document.getElementById('w4Wages');
   const w4WithheldEst = document.getElementById('w4WithheldEst');
   
   const continueBtn4 = document.getElementById('continueBtn4');
   
   function resetW4(){
     w4OptUpload.classList.remove('active'); w4OptManual.classList.remove('active');
     w4UploadBox.style.display = 'none'; w4ManualBox.style.display = 'none';
   }
   w4ModeRadios.forEach(r=>{
     r.addEventListener('change', ()=>{
       resetW4();
       if(r.value==='upload'){ w4OptUpload.classList.add('active'); w4UploadBox.style.display='block'; appState.w2.mode='upload'; }
       if(r.value==='manual'){ w4OptManual.classList.add('active'); w4ManualBox.style.display='block'; appState.w2.mode='manual'; }
       validateW4();
     });
   });
   
   function estimateWithholdingFromWages(total){ return Math.max(0, total * 0.09); } // ~midpoint
   function updateManualEst(){
     const wages = Number(w4Wages.value || 0);
     const est = Math.round(estimateWithholdingFromWages(wages));
     w4WithheldEst.textContent = '$' + est.toLocaleString();
     appState.w2.wages = wages;
     appState.w2.withheld = est;
   }
   w4Wages.addEventListener('input', ()=>{ updateManualEst(); validateW4(); });
   
   function updateW4UploadUI(){
     const count = w4Files.files ? w4Files.files.length : 0;
     if(count>0){
       let totalBytes=0; const names=[];
       for(let i=0;i<count;i++){ const f=w4Files.files[i]; totalBytes+=f.size; names.push(f.name); }
       w4UploadSummary.textContent = `${count} file(s) selected – total ${humanSize(totalBytes)}: ${names.slice(0,3).join(', ')}${names.length>3?' …':''}`;
       w4UploadSummary.style.display='block';
       w4UploadBtnLabel.textContent='Replace Files';
       w4UploadPrompt.textContent='Files selected';
       w4UploadSub.textContent='You can replace them anytime.';
       appState.w2.uploaded = true;
     }else{
       w4UploadSummary.style.display='none';
       w4UploadBtnLabel.textContent='Choose Files';
       w4UploadPrompt.textContent='Drag & drop your W-2s here or click to upload';
       w4UploadSub.textContent='PDF/JPG/PNG · multiple files allowed';
       appState.w2.uploaded = false;
     }
   }
   w4UploadArea.addEventListener('dragover', e=>{ e.preventDefault(); w4UploadArea.classList.add('dragover'); });
   w4UploadArea.addEventListener('dragleave', ()=> w4UploadArea.classList.remove('dragover'));
   w4UploadArea.addEventListener('drop', e=>{
     e.preventDefault(); w4UploadArea.classList.remove('dragover');
     if(e.dataTransfer.files.length>0){
       try{ w4Files.files = e.dataTransfer.files; }catch(_){ }
       updateW4UploadUI(); validateW4();
     }
   });
   w4Files.addEventListener('change', ()=>{ updateW4UploadUI(); validateW4(); });
   
   function validateW4(){
     const mode = document.querySelector('input[name="w4Mode"]:checked')?.value;
     let ok = false;
     if(mode==='upload'){
       ok = w4Files.files && w4Files.files.length>0;
     }else if(mode==='manual'){
       ok = Number(w4Wages.value||0) > 0; // withholding is auto-estimated
     }
     toggleBtn(continueBtn4, !!ok);
   }
   validateW4();
   
   continueBtn4.addEventListener('click', ()=>{
     if(!continueBtn4.classList.contains('active')) return;
     if(appState.w2.mode==='upload'){
       showToast(`Great — ${w4Files.files.length} W-2 file(s) ready to go.`, 'success');
     }
     go('screen4','screenFinal');
     computeAndRenderRefund();
     launchConfetti(24);
   });
   
   /* ---------- FINAL: Refund ---------- */
   const fileReturnBtn=document.getElementById('fileReturnBtn');
   fileReturnBtn.addEventListener('click',()=>{if(!fileReturnBtn.classList.contains('active'))return;go('screenFinal','screen6');});
   
   function computeAndRenderRefund(){
     const tuition = Number(appState.tuition.amount||0);
     const wages   = Number(appState.w2.wages||0);
     const withheld= Number(appState.w2.withheld||0);
   
     // Demo formula
     const tuitionCap = Math.min(tuition,10000);
     let base = withheld - 0.10*wages + 0.20*tuitionCap;
     if(!isFinite(base)||isNaN(base)) base=0; 
     base=Math.max(0,base);
   
     const jitter=(Math.random()*0.06)-0.03, mid=Math.max(0,base*(1+jitter));
     let low=Math.round(mid*0.88), high=Math.round(mid*1.12);
     if(mid<80){ low=Math.max(0,Math.round(mid*0.6)); high=Math.round(mid+120); }
     if(high<low)[low,high]=[high,low];
     document.getElementById('refundRange').textContent=`${fmtMoney(low)} – ${fmtMoney(high)}`;
   
     const threeTotal=Math.round(mid*3);
     const tripleNote=document.getElementById('tripleNote');
     if (threeTotal > 0) {
       tripleNote.style.display = 'block';
       tripleNote.innerHTML = `You can still claim each of the last 3 years — that’s about <strong>${fmtMoney(threeTotal)}</strong> total.`;
     } else {
       tripleNote.style.display = 'none';
     }
     const hl=[];
     if(appState.tuition.mode==='manual'&&tuition>0)hl.push('Tuition entered');
     if(appState.w2.uploaded)hl.push('W-2 uploaded');
     if(wages>0)hl.push('W-2 wages added');
     const hlList=document.getElementById('hlList'); 
     hlList.innerHTML='';
     hl.slice(0,4).forEach(t=>{
       const s=document.createElement('span');s.className='chip';s.textContent=t;hlList.appendChild(s);
     });
   
     toggleBtn(fileReturnBtn,true); fileReturnBtn.classList.add('pulse');
   }
   
   /* ---------- Screen 6: Sold stocks/crypto? ---------- */
   const sellYes=document.getElementById('sellYes'),
         sellNo=document.getElementById('sellNo'),
         sellRadios=document.querySelectorAll('input[name="sellOption"]'),
         continueBtn6=document.getElementById('continueBtn6');
   function resetSell(){sellYes.classList.remove('active');sellNo.classList.remove('active');}
   sellRadios.forEach(r=>{
     r.addEventListener('change',()=>{
       resetSell();
       if(r.value==='yes'){sellYes.classList.add('active');appState.soldSecurities='yes';}
       if(r.value==='no'){sellNo.classList.add('active');appState.soldSecurities='no';}
       toggleBtn(continueBtn6,true);
     });
   });
   toggleBtn(continueBtn6,false);
   continueBtn6.addEventListener('click',()=>{
     if(!continueBtn6.classList.contains('active'))return;
     const checked=document.querySelector('input[name="sellOption"]:checked')?.value;
     if(checked==='yes'){go('screen6','screenNS');}else{go('screen6','screen8');}
   });
   
   /* ---------- Screen 8: 1095-A ---------- */
   const a1095Yes=document.getElementById('a1095Yes'),
         a1095No=document.getElementById('a1095No'),
         a1095Radios=document.querySelectorAll('input[name="a1095Option"]'),
         continueBtn8=document.getElementById('continueBtn8');
   function resetA1095(){a1095Yes.classList.remove('active');a1095No.classList.remove('active');}
   a1095Radios.forEach(r=>{
     r.addEventListener('change',()=>{
       resetA1095();
       if(r.value==='yes'){a1095Yes.classList.add('active');appState.has1095A='yes';}
       if(r.value==='no'){a1095No.classList.add('active');appState.has1095A='no';}
       toggleBtn(continueBtn8,true);
     });
   });
   toggleBtn(continueBtn8,false);
   continueBtn8.addEventListener('click',()=>{
     if(!continueBtn8.classList.contains('active'))return;
     const v=document.querySelector('input[name="a1095Option"]:checked')?.value;
     if(v==='yes'){go('screen8','screenNS');}else{go('screen8','screen9');}
   });
   
   /* ---------- Screen 9: Citizen/GC ---------- */
   const citYes=document.getElementById('citYes'),
         citNo=document.getElementById('citNo'),
         citRadios=document.querySelectorAll('input[name="citOption"]'),
         continueBtn9=document.getElementById('continueBtn9');
   function resetCit(){citYes.classList.remove('active');citNo.classList.remove('active');}
   citRadios.forEach(r=>{
     r.addEventListener('change',()=>{
       resetCit();
       if(r.value==='yes'){citYes.classList.add('active');appState.citizenOrGC='yes';}
       if(r.value==='no'){citNo.classList.add('active');appState.citizenOrGC='no';}
       toggleBtn(continueBtn9,true);
     });
   });
   toggleBtn(continueBtn9,false);
   continueBtn9.addEventListener('click',()=>{
     if(!continueBtn9.classList.contains('active'))return;
     const v=document.querySelector('input[name="citOption"]:checked')?.value;
     if(v==='no'){
       go('screen9','screenNS');
     }else{
       // go to the new Upload Missing Docs screen
       renderMissingDocs();
       go('screen9','screenUpload');
     }
   });
   
   /* ---------- NEW: Upload Missing Docs ---------- */
   const missingList = document.getElementById('missingList');
   const missingIntro = document.getElementById('missingIntro');
   const noMissingHint = document.getElementById('noMissingHint');
   
   const missingUploadArea = document.getElementById('missingUploadArea');
   const missingFiles = document.getElementById('missingFiles');
   const missingUploadPrompt = document.getElementById('missingUploadPrompt');
   const missingUploadSub = document.getElementById('missingUploadSub');
   const missingUploadBtnLabel = document.getElementById('missingUploadBtnLabel');
   const missingUploadSummary = document.getElementById('missingUploadSummary');
   
   const submitMissingBtn = document.getElementById('submitMissingBtn');
   
   function computeMissingDocs(){
     const req = [];
     if(appState.tuition.mode === 'manual'){
       req.push('1098-T (Tuition statement)');
     }
     if(appState.incomeType === 'w2' && appState.w2.mode === 'manual'){
       req.push('W-2 form(s) from your employer(s)');
     }
     if(appState.soldSecurities === 'yes'){
       req.push('1099-B / Crypto gains report');
     }
     if(appState.has1095A === 'yes'){
       req.push('1095-A (Health Insurance Marketplace)');
     }
     return req;
   }
   
   function renderMissingDocs(){
     const req = computeMissingDocs();
     missingList.innerHTML = '';
     if(req.length === 0){
       missingIntro.textContent = 'Great! We don’t see any required documents missing.';
       noMissingHint.style.display = 'block';
     }else{
       missingIntro.textContent = 'To file your refund, please upload:';
       noMissingHint.style.display = 'none';
       req.forEach(text=>{
         const li = document.createElement('li');
         const check = document.createElement('span');
         check.className='check';
         check.textContent='•';
         li.appendChild(check);
         const span = document.createElement('span');
         span.textContent = text;
         li.appendChild(span);
         missingList.appendChild(li);
       });
     }
     resetMissingUploadUI();
   }
   
   function resetMissingUploadUI(){
     missingUploadSummary.style.display='none';
     missingUploadBtnLabel.textContent='Choose Files';
     missingUploadPrompt.textContent='Drag & drop or click to upload';
     missingUploadSub.textContent='PDF/JPG/PNG · multiple files allowed';
     missingFiles.value = '';
   }
   function updateMissingUploadUI(){
     const count = missingFiles.files ? missingFiles.files.length : 0;
     if(count>0){
       let totalBytes=0; const names=[];
       for(let i=0;i<count;i++){ const f=missingFiles.files[i]; totalBytes+=f.size; names.push(f.name); }
       missingUploadSummary.textContent = `${count} file(s) selected – total ${humanSize(totalBytes)}: ${names.slice(0,3).join(', ')}${names.length>3?' …':''}`;
       missingUploadSummary.style.display='block';
       missingUploadBtnLabel.textContent='Replace Files';
       missingUploadPrompt.textContent='Files selected';
       missingUploadSub.textContent='You can replace them anytime.';
       toggleBtn(submitMissingBtn, true);
     }else{
       resetMissingUploadUI();
       toggleBtn(submitMissingBtn, false);
     }
   }
   missingUploadArea.addEventListener('dragover', e=>{ e.preventDefault(); missingUploadArea.classList.add('dragover'); });
   missingUploadArea.addEventListener('dragleave', ()=> missingUploadArea.classList.remove('dragover'));
   missingUploadArea.addEventListener('drop', e=>{
     e.preventDefault(); missingUploadArea.classList.remove('dragover');
     if(e.dataTransfer.files.length>0){
       try{ missingFiles.files = e.dataTransfer.files; }catch(_){ }
       updateMissingUploadUI();
     }
   });
   missingFiles.addEventListener('change', updateMissingUploadUI);
   toggleBtn(submitMissingBtn, false);
   
   // Submit → go to choice screen (DIY vs We-file)
   submitMissingBtn.addEventListener('click', ()=>{
     if(!submitMissingBtn.classList.contains('active')) return;
     showToast('Documents received. Almost done.','success');
     go('screenUpload','screenChoice');
   });
   
   /* ---------- Choice Screen (DIY vs We-file) ---------- */
   const btnDownloadPDF = document.getElementById('btnDownloadPDF');
   const btnWeFile = document.getElementById('btnWeFile');
   
   if (btnDownloadPDF) {
     btnDownloadPDF.addEventListener('click', ()=>{
       showToast('Generating your PDF…','info',2000);
       // Example: window.location.href = '/ready-refund.pdf';
       // Or: generateAndDownloadPDF(appState);
     });
   }
   if (btnWeFile) {
     btnWeFile.addEventListener('click', ()=>{
       showToast('Great — we’ll file for you. Let’s collect payment.','success');
       // Example: go('screenChoice','screenPayment'); or open Stripe Checkout
     });
   }
   
   /* ---------- End screen notify ---------- */
   const notifyEmail=document.getElementById('notifyEmail'),
         notifyBtn=document.getElementById('notifyBtn');
   function isValidEmail(e){const re=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;return re.test(String(e).trim());}
   function validateEmail(){toggleBtn(notifyBtn,isValidEmail(notifyEmail.value));}
   notifyEmail.addEventListener('input',validateEmail);validateEmail();
   notifyBtn.addEventListener('click',()=>{
     if(!notifyBtn.classList.contains('active'))return;
     showToast(`We’ll notify you at ${notifyEmail.value}.`,'success');
     notifyBtn.textContent='You’ll be notified';
     notifyBtn.classList.remove('active');
     notifyBtn.disabled=true;
   });
   
   /* ---------- Confetti ---------- */
   const confettiRoot=document.getElementById('confetti');
   function launchConfetti(count=20){
     confettiRoot.innerHTML='';
     for(let i=0;i<count;i++){
       const piece=document.createElement('span');
       piece.style.left=Math.random()*100+'vw';
       piece.style.animationDelay=(Math.random()*0.4)+'s';
       piece.style.transform=`translateY(0) rotate(${Math.random()*180}deg)`;
       confettiRoot.appendChild(piece);
     }
     setTimeout(()=>{confettiRoot.innerHTML='';},2600);
   }
   
   /* ---------- Landing → App ---------- */
   function openApp(){
     const landing = document.getElementById('landing');
     const app = document.getElementById('app');
     const header = document.querySelector('header');
     if(landing) landing.style.display = 'none';
     if(header) header.style.display = 'none';
     if(app){
       app.style.display = 'block';
       document.body.classList.add('app-mode');
       window.scrollTo({top:0, behavior:'instant'});
     }
   }
   document.querySelectorAll('.nav-cta, #ctaStart').forEach(el=>{
     el.addEventListener('click', e=>{ e.preventDefault(); openApp(); });
   });
   