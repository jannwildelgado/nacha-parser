import test from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs/promises'

import { NACHAReader } from './parser.mjs'

test('NACHReader', async () => {
  const ach = await fs.readFile('./sample.ach', 'utf8')

  const nacha = new NACHAReader(ach)

  const fileheader = nacha.get_file_header()

  assert.strictEqual(fileheader.recordTypeCode.length, 1, 'File Header: invalid length record type code')
  assert.strictEqual(fileheader.priorityCode.length, 2, 'File Header: invalid length priority code')
  assert.strictEqual(fileheader.immediateDestination.length, 10, 'File Header: invalid length immediate destination')
  assert.strictEqual(fileheader.immediateOrigin.length, 10, 'File Header: invalid length immediate origin')
  assert.strictEqual(fileheader.fileCreationDate.length, 6, 'File Header: invalid length file creation date')
  assert.strictEqual(fileheader.fileCreationTime.length, 4, 'File Header: invalid length file creation time')
  assert.strictEqual(fileheader.fileIDModifier.length, 1, 'File Header: invalid length file ID modifier')
  assert.strictEqual(fileheader.recordSize.length, 3, 'File Header: invalid length record size')
  assert.strictEqual(fileheader.blockingFactor.length, 2, 'File Header: invalid length blocking factor')
  assert.strictEqual(fileheader.formatCode.length, 1, 'File Header: invalid length format code')
  assert.strictEqual(fileheader.immediateDestinationName.length, 23, 'File Header: invalid length immediate destination name')
  assert.strictEqual(fileheader.immediateOriginName.length, 23, 'File Header: invalid length immediate origin name')
  assert.strictEqual(fileheader.referenceCode.length, 8, 'File Header: invalid length referrence code')

  const batchheader = nacha.get_batch_header()

  assert.strictEqual(batchheader.recordTypeCode.length, 1, 'Batch Header: invalid length record type code')
  assert.strictEqual(batchheader.serviceClassCode.length, 3, 'Batch Header: invalid length service class code')
  assert.strictEqual(batchheader.companyName.length, 16, 'Batch Header: invalid length company name')
  assert.strictEqual(batchheader.companyDiscretionaryData.length, 20, 'Batch Header: invalid length company dicretionary data')
  assert.strictEqual(batchheader.companyIdentification.length, 10, 'Batch header: invalid length company identificaiton')
  assert.strictEqual(batchheader.standardEntryClassCode.length, 3, 'Batch header: invalid length standard entry class code')
  assert.strictEqual(batchheader.companyEntryDescription.length, 10, 'Batch header: invalid length company entry description')
  assert.strictEqual(batchheader.companyDescriptiveDate.length, 6, 'Batch header: invalid length company descriptive date')
  assert.strictEqual(batchheader.effectiveEntryDate.length, 6, 'Batch header: invalid length effective entry date')
  assert.strictEqual(batchheader.settlementDateJulian.length, 3, 'Batch header: invalid length settlement date')
  assert.strictEqual(batchheader.originatorStatusCode.length, 1, 'Batch header: invalid length originator status code')
  assert.strictEqual(batchheader.originatingDFIIdentification.length, 8, 'Batch header: invalid length originating DFI identification')
  assert.strictEqual(batchheader.batchNumber.length, 7, 'Batch header: invalid length batch number')

  const entrydetail = nacha.get_entry_detail()

  for (let ed of entrydetail) {
    assert.strictEqual(ed.recordTypeCode.length, 1, 'Entry Detail: invalid length record type code')
    assert.strictEqual(ed.transactionCode.length, 2, 'Entry Detail: invalid length transaction code')
    assert.strictEqual(ed.receivingDFIIdentification.length, 8, 'Entry Detail: invalid length receiving DFI identification')
    assert.strictEqual(ed.checkDigit.length, 1, 'Entry Detail: invalid length check digit')
    assert.strictEqual(ed.DFIAccountNumber.length, 17, 'Entry Detail: invalid length DFI account number')
    assert.strictEqual(ed.amount.length, 10, 'Entry Detail: invalid length amount')
    assert.strictEqual(ed.individualIdentificationNumber.length, 15, 'Entry Detail: invalid length individual identification number')
    assert.strictEqual(ed.individualName.length, 22, 'Entry Detail: invalid length individual name')
    assert.strictEqual(ed.discretionaryData.length, 2, 'Entry Detail: invalid length discretionary data')
    assert.strictEqual(ed.addendaRecordIndicator.length, 1, 'Entry Detail: invalid length addenda record indicator')
    assert.strictEqual(ed.traceNumber.length, 15, 'Entry Detail: invalid length trace number')
  }

  const batchcontrol = nacha.get_batch_control()

  assert.strictEqual(batchcontrol.recordTypeCode.length, 1, 'Batch Control: invalid length record type code')
  assert.strictEqual(batchcontrol.serviceClassCode.length, 3, 'Batch Control: invalid length service class code')
  assert.strictEqual(batchcontrol.entryAddendaCount.length, 6, 'Batch Control: invalid length entry addenda count')
  assert.strictEqual(batchcontrol.entryHash.length, 10, 'Batch Control: invalid length entry hash')
  assert.strictEqual(batchcontrol.totalDebitEntryDollarAmount.length, 12, 'Batch Control: invalid length total debit entry dollar amount')
  assert.strictEqual(batchcontrol.totalCreditEntryDollarAmount.length, 12, 'Batch Control: invalid length total credit entry dollar amount')
  assert.strictEqual(batchcontrol.companyIdentification.length, 10, 'Batch Control: invalid length company identification')
  assert.strictEqual(batchcontrol.messageAuthenticationCode.length, 19, 'Batch Control: invalid length message authentication code')
  assert.strictEqual(batchcontrol.reserved.length, 6, 'Batch Control: invalid length reserved')
  assert.strictEqual(batchcontrol.originatingDFIIdentification.length, 8, 'Batch Control: invalid length originating DFI identification')
  assert.strictEqual(batchcontrol.batchNumber.length, 7, 'Batch Control: invalid length batch number')

  const filecontrol = nacha.get_file_control()

  assert.strictEqual(filecontrol.recordTypeCode.length, 1, 'File Control: invalid length record type code')
  assert.strictEqual(filecontrol.batchCount.length, 6, 'File Control: invalid length batch count')
  assert.strictEqual(filecontrol.blockCount.length, 6, 'File Control: invalid length block count')
  assert.strictEqual(filecontrol.entryAddendaCount.length, 8, 'File Control: invalid length entry addenda count')
  assert.strictEqual(filecontrol.entryHash.length, 10, 'File Control: invalid length entry hash')
  assert.strictEqual(filecontrol.totalDebitEntryDollarAmount.length, 12, 'File Control: invalid length total debit entry dollar amount')
  assert.strictEqual(filecontrol.totalCreditEntryDollarAmount.length, 12, 'File Control: invalid length total credit entry dollar amount')
  assert.strictEqual(filecontrol.reserved.length, 39, 'File Control: invalid length reserved')
})
