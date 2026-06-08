const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replacements mapping
  const replacements = [
    { from: /bg-indigo-600/g, to: 'bg-av-orange' },
    { from: /text-indigo-600/g, to: 'text-av-orange' },
    { from: /border-indigo-600/g, to: 'border-av-orange' },
    { from: /ring-indigo-600/g, to: 'ring-av-orange' },
    { from: /shadow-indigo-100/g, to: 'shadow-av-orange/20' },
    { from: /shadow-indigo-200/g, to: 'shadow-av-orange/20' },
    { from: /bg-indigo-50/g, to: 'bg-av-orange-light' },
    { from: /text-indigo-50/g, to: 'text-av-orange-light' },
    { from: /bg-indigo-100/g, to: 'bg-av-orange-light' },
    { from: /bg-indigo-500/g, to: 'bg-av-orange' },
    { from: /text-indigo-500/g, to: 'text-av-orange' },
    { from: /bg-indigo-700/g, to: 'bg-av-orange-hover' },
    { from: /text-indigo-700/g, to: 'text-av-orange-hover' },
    { from: /border-indigo-500/g, to: 'border-av-orange' },
    { from: /border-indigo-300/g, to: 'border-av-orange/50' },
    { from: /ring-indigo-500/g, to: 'ring-av-orange' },
    { from: /bg-blue-100/g, to: 'bg-av-light-blue' },
    { from: /text-blue-600/g, to: 'text-av-navy' },
    { from: /bg-blue-50/g, to: 'bg-av-light-blue' },
    { from: /rounded-2xl/g, to: 'rounded-[16px]' },
    { from: /rounded-xl/g, to: 'rounded-[16px]' }
  ];

  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  fs.writeFileSync(filePath, content, 'utf8');
};

const dirsToProcess = [
  'c:/Projects/booking-app-react/frontend/src/pages/dashboard',
  'c:/Projects/booking-app-react/frontend/src/components/booking',
  'c:/Projects/booking-app-react/frontend/src/components/steps',
  'c:/Projects/booking-app-react/frontend/src/pages/auth'
];

dirsToProcess.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      replaceInFile(path.join(dir, file));
    }
  });
});
console.log("Done");
