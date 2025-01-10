import Arweave from 'arweave'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

interface BookContent {
  pdf: File
  epub: File
  cover: File
  metadata: {
    title: string
    author: string
    description: string
    formats: {
      pdf: {
        size: number
        type: string
      }
      epub: {
        size: number
        type: string
      }
    }
  }
}

interface ArweaveUploadResult {
  pdfHash: string
  epubHash: string
  coverHash: string
  metadataHash: string
}

export class ArweaveService {
  async uploadBookContent(content: BookContent): Promise<ArweaveUploadResult> {
    // Upload PDF
    const pdfTransaction = await arweave.createTransaction({
      data: await content.pdf.arrayBuffer()
    })
    pdfTransaction.addTag('Content-Type', 'application/pdf')
    pdfTransaction.addTag('App-Name', 'ReadmeClubs')
    pdfTransaction.addTag('Format', 'PDF')
    
    // Upload EPUB
    const epubTransaction = await arweave.createTransaction({
      data: await content.epub.arrayBuffer()
    })
    epubTransaction.addTag('Content-Type', 'application/epub+zip')
    epubTransaction.addTag('App-Name', 'ReadmeClubs')
    epubTransaction.addTag('Format', 'EPUB')

    // Upload cover
    const coverTransaction = await arweave.createTransaction({
      data: await content.cover.arrayBuffer()
    })
    coverTransaction.addTag('Content-Type', content.cover.type)
    coverTransaction.addTag('App-Name', 'ReadmeClubs')
    coverTransaction.addTag('Type', 'Cover')

    // Create and upload metadata
    const metadata = {
      ...content.metadata,
      pdfHash: pdfTransaction.id,
      epubHash: epubTransaction.id,
      coverHash: coverTransaction.id
    }
    
    const metadataTransaction = await arweave.createTransaction({
      data: JSON.stringify(metadata)
    })
    metadataTransaction.addTag('Content-Type', 'application/json')
    metadataTransaction.addTag('App-Name', 'ReadmeClubs')
    metadataTransaction.addTag('Type', 'Metadata')

    return {
      pdfHash: pdfTransaction.id,
      epubHash: epubTransaction.id,
      coverHash: coverTransaction.id,
      metadataHash: metadataTransaction.id
    }
  }
}