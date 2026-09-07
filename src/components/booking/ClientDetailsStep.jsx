import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { clientDetailsSchema, clientDetailsDefaultValues } from '@/booking/schemas'
import { StepHeader, StepFooter } from './StepChrome'

const fieldClass =
  'rounded-none border-0 border-b border-brand-rule bg-transparent px-0.5 py-2.5 text-[13px] text-brand-text shadow-none placeholder:text-brand-text-faint focus-visible:ring-0 focus-visible:border-brand-copper-deep'

// Step 3 — Client Details. react-hook-form + zod (src/booking/schemas.js);
// Continue is disabled until the form is valid.
const ClientDetailsStep = ({ defaultValues, onSubmitStep, onBack }) => {
  const form = useForm({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues: defaultValues ?? clientDetailsDefaultValues,
    mode: 'onChange',
  })

  // Force an initial validation pass so the Continue button starts in the
  // correct (disabled) state rather than briefly reporting valid before the
  // first field interaction.
  useEffect(() => {
    form.trigger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    form.setValue('inspirationPhoto', file, { shouldValidate: true })
  }

  const photo = form.watch('inspirationPhoto')

  return (
    <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
      <StepHeader stepIndex={2} title="Tell me about your look." />

      <Form {...form}>
        <form
          id="client-details-form"
          onSubmit={form.handleSubmit(onSubmitStep)}
          className="flex flex-1 flex-col gap-3.5"
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="gap-1">
                <FormControl>
                  <Input placeholder="Full name" className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="gap-1">
                <FormControl>
                  <Input type="tel" placeholder="Phone number" className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="gap-1">
                <FormControl>
                  <Input type="email" placeholder="Email" className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="occasion"
            render={({ field }) => (
              <FormItem className="gap-1">
                <FormControl>
                  <Input placeholder="Occasion (wedding, event, shoot…)" className={fieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="gap-1">
                <FormControl>
                  <Textarea
                    placeholder="Notes for Emmanuelle"
                    rows={2}
                    className={`min-h-0 resize-none ${fieldClass}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <label className="mt-1 flex cursor-pointer flex-col items-center gap-1 border border-dashed border-brand-rule bg-brand-ivory-soft p-4.5 text-center text-[11.5px] text-brand-text-faint transition-colors hover:border-brand-gold">
            <span>{photo ? `✓ ${photo.name}` : '＋ Upload an inspiration photo'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </label>
          {form.formState.errors.inspirationPhoto && (
            <p className="text-[11px] text-brand-danger-deep">{form.formState.errors.inspirationPhoto.message}</p>
          )}
        </form>
      </Form>

      <StepFooter
        onBack={onBack}
        continueType="submit"
        formId="client-details-form"
        continueLabel="Continue"
        continueDisabled={!form.formState.isValid}
      />
    </div>
  )
}

export default ClientDetailsStep
