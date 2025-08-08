import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const auditSectionVariants = cva(
  "border-l-4",
  {
    variants: {
      variant: {
        infrastructure: "bg-blue-50 border-l-blue-700",
        assessment: "bg-green-50 border-l-green-700", 
        special: "bg-purple-50 border-l-purple-700",
        organic: "bg-orange-50 border-l-orange-700",
        prevention: "bg-teal-50 border-l-teal-700",
        training: "bg-indigo-50 border-l-indigo-700",
        default: "bg-card border-l-border"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const auditSectionTitleVariants = cva(
  "text-lg font-semibold text-foreground",
  {
    variants: {
      variant: {
        infrastructure: "text-foreground",
        assessment: "text-foreground",
        special: "text-foreground", 
        organic: "text-foreground",
        prevention: "text-foreground",
        training: "text-foreground",
        default: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface AuditSectionProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auditSectionVariants> {
  title?: string
  description?: string
}

const AuditSection = React.forwardRef<HTMLDivElement, AuditSectionProps>(
  ({ className, variant, title, description, children, ...props }, ref) => {
    return (
      <Card 
        ref={ref}
        className={cn(auditSectionVariants({ variant }), className)}
        {...props}
      >
        {(title || description) && (
          <CardHeader className="pb-4">
            {title && (
              <h3 className={cn(auditSectionTitleVariants({ variant }))}>
                {title}
              </h3>
            )}
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </CardHeader>
        )}
        {children && (
          <CardContent className={title || description ? "pt-0" : ""}>
            {children}
          </CardContent>
        )}
      </Card>
    )
  }
)
AuditSection.displayName = "AuditSection"

export { AuditSection, auditSectionVariants }