/**
 * Created by samuel on 1/19/18.
 */

console.log("Welcome to submitting!");
var program = require('commander');

program
    .version('0.0.1')
    .description('Client Side for a decentralized course-project submitting system')

// start node - setup account - migrate contract
// create a directory to keep the (transaction, hash) pair
program
    .command('init')
    .description('init envrionment')

program
    .command('create <project>')
    .description('creat an empty project')

program
    .command('help')
    .description('help document')

program
    .command('peer')
    .description('check the peer info')

program
    .command('submit <filename>')
    .description('submit file')
    .action(function(){
        console.log("Submitted");
    })
    .parse(process.argv);

program
    .command('upload <filename>')
    .description('upload file to server')

program
    .command('start')
    .description('start app')