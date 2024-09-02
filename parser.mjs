#!/usr/bin/env node

import assert from 'node:assert/strict'

/**
  * @typedef FileHeader
  * @type {object}
  * @property {string} recordTypeCode
  * @property {string} priorityCode
  * @property {string} immediateDestination
  * @property {string} immediateOrigin
  * @property {string} fileCreationDate
  * @property {string} fileCreationTime
  * @property {string} fileIDModifier
  * @property {string} recordSize
  * @property {string} blockingFactor
  * @property {string} formatCode
  * @property {string} immediateDestinationName
  * @property {string} immediateOriginName
  * @property {string} referenceCode
  * */

  /**
  * @typedef BatchHeader
  * @type {object}
  * @property {string} recordTypeCode
  * @property {string} serviceClassCode
  * @property {string} companyName
  * @property {string} companyDiscretionaryData
  * @property {string} companyIdentification
  * @property {string} standardEntryClassCode
  * @property {string} companyEntryDescription
  * @property {string} companyDescriptiveDate
  * @property {string} effectiveEntryDate
  * @property {string} settlementDateJulian
  * @property {string} originatorStatusCode
  * @property {string} originatingDFIIdentification
  * @property {string} batchNumber
  * */

  /**
  * @typedef EntryDetail
  * @type {object}
  * @property {string} recordTypeCode
  * @property {string} transactionCode
  * @property {string} receivingDFIIdentification
  * @property {string} checkDigit
  * @property {string} DFIAccountNumber
  * @property {string} amount
  * @property {string} individualIdentificationNumber
  * @property {string} individualName
  * @property {string} discretionaryData
  * @property {string} addendaRecordIndicator
  * @property {string} traceNumber
  * */

  /**
  * @typedef BatchControl
  * @type {object}
  * @property {string} recordTypeCode
  * @property {string} serviceClassCode
  * @property {string} entryAddendaCount
  * @property {string} entryHash
  * @property {string} totalDebitEntryDollarAmount
  * @property {string} totalCreditEntryDollarAmount
  * @property {string} companyIdentification
  * @property {string} messageAuthenticationCode
  * @property {string} reserved
  * @property {string} originatingDFIIdentification
  * @property {string} batchNumber
  * */

  /**
  * @typedef FileControl
  * @type {object}
  * @property {string} recordTypeCode
  * @property {string} batchCount
  * @property {string} blockCount
  * @property {string} entryAddendaCount
  * @property {string} entryHash
  * @property {string} totalDebitEntryDollarAmount
  * @property {string} totalCreditEntryDollarAmount
  * @property {string} reserved
  * */
export class NACHAReader {
  /** @type {FileHeader|null} */
  #fh
  /** @type {BatchHeader|null}  */
  #bh
  /** @type {Array.<EntryDetail>}  */
  #ed
  /** @type {BatchControl|null}  */
  #bc
  /** @type {FileControl|null}  */
  #fc

  /** @type {Array.<string>}  */
  #nacha

  /**
    * @param {string} achStr
    * */
  constructor(ach) {
    assert.ok(typeof ach === 'string', 'You must pass string value')
    assert.ok(ach.length, 'You pass empty string')

    this.#nacha = ach.split('\n').filter(e => e.length)

    this.#fh = null
    this.#bh = null
    this.#ed = []
    this.#bc = null
    this.#fc = null

    for (let i = 0; i < this.#nacha.length; i++) {
      /* File Control **/
      if (this.#nacha[i][0] === '9') {
        this.#set_file_control({
          recordTypeCode: this.#nacha[i][0],
          batchCount: this.#nacha[i].substring(1, 7),
          blockCount: this.#nacha[i].substring(7, 13),
          entryAddendaCount: this.#nacha[i].substring(13, 21),
          entryHash: this.#nacha[i].substring(21, 31),
          totalDebitEntryDollarAmount: this.#nacha[i].substring(31, 43),
          totalCreditEntryDollarAmount: this.#nacha[i].substring(43, 55),
          reserved: this.#nacha[i].substring(55, 94)
        })

        break
      }

      /* File Header **/
      if (this.#nacha[i][0] === '1') {
        this.#set_file_header({
          recordTypeCode: this.#nacha[i][0],
          priorityCode: this.#nacha[i].substring(1, 3),
          immediateDestination: this.#nacha[i].substring(3, 13),
          immediateOrigin: this.#nacha[i].substring(13, 23),
          fileCreationDate: this.#nacha[i].substring(23, 29),
          fileCreationTime: this.#nacha[i].substring(29, 33),
          fileIDModifier: this.#nacha[i].substring(33, 34),
          recordSize: this.#nacha[i].substring(34, 37),
          blockingFactor: this.#nacha[i].substring(37, 39),
          formatCode: this.#nacha[i].substring(39, 40),
          immediateDestinationName: this.#nacha[i].substring(40, 63),
          immediateOriginName: this.#nacha[i].substring(63, 86),
          referenceCode: this.#nacha[i].substring(86, 94)
        })

        continue
      }

      /* Batch Header **/
      if (this.#nacha[i][0] === '5') {
        this.#set_batch_header({
          recordTypeCode: this.#nacha[i][0],
          serviceClassCode: this.#nacha[i].slice(1, 4),
          companyName: this.#nacha[i].slice(4, 20),
          companyDiscretionaryData: this.#nacha[i].slice(20, 40),
          companyIdentification: this.#nacha[i].slice(40, 50),
          standardEntryClassCode: this.#nacha[i].slice(50, 53),
          companyEntryDescription: this.#nacha[i].slice(53, 63),
          companyDescriptiveDate: this.#nacha[i].slice(63, 69),
          effectiveEntryDate: this.#nacha[i].slice(69, 75),
          settlementDateJulian: this.#nacha[i].slice(75, 78),
          originatorStatusCode: this.#nacha[i].slice(78, 79),
          originatingDFIIdentification: this.#nacha[i].slice(79, 87),
          batchNumber: this.#nacha[i].slice(87, 94),
        })

        continue
      }

      /*  Entry Detail Record **/
      if (this.#nacha[i][0] === '6') {
        this.#set_entry_detail({
          recordTypeCode: this.#nacha[i][0],
          transactionCode: this.#nacha[i].slice(1, 3),
          receivingDFIIdentification: this.#nacha[i].slice(3, 11),
          checkDigit: this.#nacha[i].slice(11, 12),
          DFIAccountNumber: this.#nacha[i].slice(12, 29),
          amount: this.#nacha[i].slice(29, 39),
          individualIdentificationNumber: this.#nacha[i].slice(39, 54),
          individualName: this.#nacha[i].slice(54, 76),
          discretionaryData: this.#nacha[i].slice(76, 78),
          addendaRecordIndicator: this.#nacha[i].slice(78, 79),
          traceNumber: this.#nacha[i].slice(79, 94)
        })
      }

      /* Batch Control Record **/
      if (this.#nacha[i][0] === '8') {
        this.#set_batch_control({
          recordTypeCode: this.#nacha[i][0],
          serviceClassCode: this.#nacha[i].slice(1, 4),
          entryAddendaCount: this.#nacha[i].slice(4, 10),
          entryHash: this.#nacha[i].slice(10, 20),
          totalDebitEntryDollarAmount: this.#nacha[i].slice(20, 32),
          totalCreditEntryDollarAmount: this.#nacha[i].slice(32, 44),
          companyIdentification: this.#nacha[i].slice(44, 54),
          messageAuthenticationCode: this.#nacha[i].slice(54, 73),
          reserved: this.#nacha[i].slice(73, 79),
          originatingDFIIdentification: this.#nacha[i].slice(79, 87),
          batchNumber: this.#nacha[i].slice(87, 94)
        })
      }
    }
  }

  /** @param {FileHeader} params  */
  #set_file_header(params) {
    this.#fh = params
  }

  /** @returns {FileHeader|null} */
  get_file_header() {
    return this.#fh
  }

  /** @param {BatchHeader} params  */
  #set_batch_header(params) {
    this.#bh = params
  }

  /** @returns {BatchHeader|null} */
  get_batch_header() {
    return this.#bh
  }

  /** @param {EntryDetail} params  */
  #set_entry_detail(params) {
    assert.strictEqual(params.recordTypeCode.length, 1, 'Entry Detail: invalid length record type code')
    assert.strictEqual(params.transactionCode.length, 2, 'Entry Detail: invalid length transaction code')
    assert.strictEqual(params.receivingDFIIdentification.length, 8, 'Entry Detail: invalid length receiving DFI identification')
    assert.strictEqual(params.checkDigit.length, 1, 'Entry Detail: invalid length check digit')
    assert.strictEqual(params.DFIAccountNumber.length, 17, 'Entry Detail: invalid length DFI account number')
    assert.strictEqual(params.amount.length, 10, 'Entry Detail: invalid length amount')
    assert.strictEqual(params.individualIdentificationNumber.length, 15, 'Entry Detail: invalid length individual identification number')
    assert.strictEqual(params.individualName.length, 22, 'Entry Detail: invalid length individual name')
    assert.strictEqual(params.discretionaryData.length, 2, 'Entry Detail: invalid length discretionary data')
    assert.strictEqual(params.addendaRecordIndicator.length, 1, 'Entry Detail: invalid length addenda record indicator')
    assert.strictEqual(params.traceNumber.length, 15, 'Entry Detail: invalid length trace number')

    this.#ed.push(params)
  }

  /** @returns {Array.<EntryDetail>} */
  get_entry_detail() {
    return this.#ed
  }

  /** @param {BatchControl} params  */
  #set_batch_control(params) {
    assert.strictEqual(params.recordTypeCode.length, 1, 'Batch Control: invalid length record type code')
    assert.strictEqual(params.serviceClassCode.length, 3, 'Batch Control: invalid length service class code')
    assert.strictEqual(params.entryAddendaCount.length, 6, 'Batch Control: invalid length entry addenda count')
    assert.strictEqual(params.entryHash.length, 10, 'Batch Control: invalid length entry hash')
    assert.strictEqual(params.totalDebitEntryDollarAmount.length, 12, 'Batch Control: invalid length total debit entry dollar amount')
    assert.strictEqual(params.totalCreditEntryDollarAmount.length, 12, 'Batch Control: invalid length total credit entry dollar amount')
    assert.strictEqual(params.companyIdentification.length, 10, 'Batch Control: invalid length company identification')
    assert.strictEqual(params.messageAuthenticationCode.length, 19, 'Batch Control: invalid length message authentication code')
    assert.strictEqual(params.reserved.length, 6, 'Batch Control: invalid length reserved')
    assert.strictEqual(params.originatingDFIIdentification.length, 8, 'Batch Control: invalid length originating DFI identification')
    assert.strictEqual(params.batchNumber.length, 7, 'Batch Control: invalid length batch number')

    this.#bc = params
  }

  /** @returns {BatchControl|null} */
  get_batch_control() {
    return this.#bc
  }

  /** @param {FileControl} params  */
  #set_file_control(params) {
    assert.strictEqual(params.recordTypeCode.length, 1, 'File Control: invalid length record type code')
    assert.strictEqual(params.batchCount.length, 6, 'File Control: invalid length batch count')
    assert.strictEqual(params.blockCount.length, 6, 'File Control: invalid length block count')
    assert.strictEqual(params.entryAddendaCount.length, 8, 'File Control: invalid length entry addenda count')
    assert.strictEqual(params.entryHash.length, 10, 'File Control: invalid length entry hash')
    assert.strictEqual(params.totalDebitEntryDollarAmount.length, 12, 'File Control: invalid length total debit entry dollar amount')
    assert.strictEqual(params.totalCreditEntryDollarAmount.length, 12, 'File Control: invalid length total credit entry dollar amount')
    assert.strictEqual(params.reserved.length, 39, 'File Control: invalid length reserved')

    this.#fc = params
  }

  /**
    * @returns {FileControl|null}
    * */
  get_file_control() {
    return this.#fc
  }
}
