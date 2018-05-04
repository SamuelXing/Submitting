#!/usr/bin/env node
/**
 * Created by samuel on 1/19/18.
 */

const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const {init, submit, upload, status, upload_} = require('./client');

program
    .version('0.0.1')
    .description('Client Side for a decentralized course-project submitting system')

// start node - setup account - migrate contract
program
    .command('init <name> <suid> <email> <account_address>')
    .description('init envrionment')
    .action((name, suid, email, account_address) => {
       init(name, suid, email, account_address);
    });

program
    .command('submit <filename>')
    .description('submit to blockchain')
    .action(function(filename){
        co(function *() {
            let password = yield prompt.password('password: ');
            submit(filename, password);
        });
    });

program
    .command('upload')
    .description('upload project to server')
    .action(() => {upload()});

 program
    .command('status')
    .description('check project\'s current status')
    .action(() => {status()});

program
    .command('readme')
    .description('check readme doc');

program.parse(process.argv);
