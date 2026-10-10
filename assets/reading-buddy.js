(function(){
"use strict";
const find=id=>document.getElementById(id);
const messages=find("messages"),form=find("chat-form"),field=find("question"),quick=find("quick");
const route={
 books:["../library.html#library","Find a book →"],
 kids:["../library.html?category=Children#library","Children's books →"],
 language:["../library.html#library","Search by language →"],
 audio:["../library.html#library","Find audiobooks →"],
 club:["../library.html#book-club","Book Club →"],
 upload:["../library.html#contribute","Share a book →"],
 ask:["../library.html#requests","Request a book →"],
 founder:["../index.html#founder","Meet the founder →"],
 learn:["../index.html#challenge","Reading challenge →"],
 partner:["partners.html","Partner with ReadMalawi →"],
 plans:["../library.html#support","Reading plans →"]
};
function item(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function bubble(txt,speaker,links){
 const box=item("div","bubble "+speaker,txt);
 if(links&&links.length){const row=item("div","links");for(const link of links){const a=item("a","",link[1]);a.href=link[0];row.append(a)}box.append(row)}
 messages.append(box);messages.scrollTop=messages.scrollHeight;
}
const has=(s,arr)=>arr.some(w=>s.includes(w));
function respond(phrase){
 const s=phrase.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
 if(has(s,["chichewa","chitumbuka","chiyao","chilomwe","chisena","chitonga","swahili","language","translate"]))return ["ReadMalawi welcomes Malawian and other languages. Choose a language when searching the library. Full translations are still being reviewed.",[route.language]];
 if(has(s,["moni","mabuku","ndikufuna","buku","kuwerenga","werenga"]))return ["Moni! Tiyeni tiwelenge. Let's find a book to read right here on ReadMalawi.",[route.books,route.kids]];
 if(has(s,["kids","kid","children","child","baby","young","fairy","picture book"]))return ["Let's find a story for younger readers. A grown-up can help you share comments.",[route.kids,route.learn]];
 if(has(s,["audio","listen","hearing a book","spoken"]))return ["You can look for audiobooks in our library. Choose the Audiobooks filter.",[route.audio]];
 if(has(s,["comment","discuss","book club","forum","reply","talk about","discussion","review"]))return ["You can discuss a book with other readers. Choose a title, then tap “Discuss this book.” A librarian checks comments before they appear.",[route.club]];
 if(has(s,["upload","share a book","submit","contribute","give a book","donate books","pdf"]))return ["You can share books privately with ReadMalawi. A librarian must first check permission to publish them.",[route.upload]];
 if(has(s,["request","can't find","cannot find","missing","ask for book"]))return ["Can't find a book? Use our Request a Book form.",[route.ask]];
 if(has(s,["school","science","history","maths","math","novel","story","stories","poem","poetry","fiction","technology","book","read","find"]))return ["Let's find a book in our ReadMalawi collection. You can search by title, author, language or subject.",[route.books]];
 if(has(s,["jones","founder","dd phiri","nalikungwi","about readmalawi","who started"]))return ["Jones Nalikungwi founded ReadMalawi. Read our story to learn about the project and its beginnings.",[route.founder]];
 if(has(s,["support","partner","sponsor","investor","donation","fund","help readmalawi"]))return ["You can enquire about supporting ReadMalawi. Financial contributions are not active through this website.",[route.partner]];
 if(has(s,["pay","price","download","plan","membership","subscription"]))return ["Reading approved books online is free. Download memberships are planned but not yet active.",[route.plans]];
 if(has(s,["learn","challenge","quiz","game"]))return ["Let's practise reading with a short story and one question!",[route.learn]];
 if(has(s,["hello","hi","hey","help","what can you do","start"]))return ["Hello! 👋 I can help you find books, join the Book Club, or practise reading. What would you like to do?",[route.books,route.club,route.learn]];
 return ["I can help you find books and explore ReadMalawi. For now I can't answer every open-ended question. Choose one of these to begin!",[route.books,route.club,route.learn]];
}
function send(text){const phrase=text.trim().slice(0,280);if(!phrase)return;bubble(phrase,"me");const [reply,links]=respond(phrase);bubble(reply,"bot",links)}
const presets=[["📚 Find books","Find books"],["🧒 Kids' stories","Children's books"],["💬 Book Club","Book Club"],["🌍 Languages","Chichewa"]];
for(const [label,q] of presets){const b=item("button","",label);b.type="button";b.addEventListener("click",()=>send(q));quick.append(b)}
form.addEventListener("submit",e=>{e.preventDefault();send(field.value);field.value="";field.focus()});
bubble("Moni! 👋 I'm Reading Buddy. I can help you find a book, join a book discussion, or start a reading challenge. What would you like to do?","bot",[route.books]);
})();