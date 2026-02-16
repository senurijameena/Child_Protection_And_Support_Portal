import { Form } from 'react-bootstrap'

interface FileUploadFieldProps {
  label: string
  value: string // URL after upload
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  accept?: string
  error?: string
  required?: boolean
}

export function FileUploadField({
  label,
  value,
  onChange,
  onUpload,
  accept = '.pdf,.jpg,.jpeg,.png',
  error,
  required,
}: FileUploadFieldProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      console.error(err)
      onChange('')
    }
    e.target.value = ''
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label} {required && '*'}</Form.Label>
      <Form.Control
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="auth-input"
      />
      {value && (
        <small className="text-success d-block mt-1">Uploaded: {value.split('/').pop()}</small>
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </Form.Group>
  )
}
