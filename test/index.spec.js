'use strict';

const DFrotzInterface = require('../index');

const fs = require('fs');
const q = require('q');
const childProcess = require('child_process');

const colors = require('colors');

const util = {
    expectList: (obj, props) => {
    }
};

colors.setTheme({
    warn: 'yellow',
    error: 'red',
    debug: 'blue'
});

describe('Class: DFrotzInterface', () => {
    describe('Method: constructor', () => {
        it('should set options by default', () => {
            let frotz = new DFrotzInterface();

            /*
             *util.expectList(frotz, {
             *    executable: ['equal', './frotz']
             *});
             */

            expect(frotz.executable).toEqual('./frotz/dfrotz');
            expect(frotz.gameImage).toEqual('./frotz/data/zork1/DATA/ZORK1.DAT');
            expect(frotz.saveFile).toEqual('./frotz/data/zork1/SAVE/zork1.sav');
            expect(frotz.outputFilter).toEqual(DFrotzInterface.filter);
            expect(frotz.dropAll).toEqual(true);
        });

        it('should take in options to override defaults', () => {
            let mockFilter = () => {};
            let frotz = new DFrotzInterface('test/executable', 'test/gameImage', 'test/save', mockFilter);

            expect(frotz.executable).toEqual('test/executable');
            expect(frotz.gameImage).toEqual('test/gameImage');
            expect(frotz.saveFile).toEqual('test/save');
            expect(frotz.outputFilter).toEqual(mockFilter);
            expect(frotz.dropAll).toEqual(true);
        });
    });

    describe('Method: filter', () => {});

    describe('Method: command', () => {});

    describe('Method: iteration', () => {});
});
