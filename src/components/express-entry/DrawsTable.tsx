import { ExpressEntryDraw } from '@/types/express-entry';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface DrawsTableProps {
  draws: ExpressEntryDraw[];
}

const typeLabels: Record<string, string> = {
  general: 'Geral',
  pnp: 'Provincial Nominee',
  cec: 'Canadian Experience',
  category: 'Categoria Específica',
};

const typeBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  general: 'default',
  pnp: 'secondary',
  cec: 'outline',
  category: 'default',
};

export const DrawsTable = ({ draws }: DrawsTableProps) => {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">ITAs</TableHead>
              <TableHead className="text-right">CRS Mínimo</TableHead>
              <TableHead className="w-[100px]">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draws.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum draw encontrado
                </TableCell>
              </TableRow>
            ) : (
              draws.map((draw) => (
                <TableRow key={draw.id}>
                  <TableCell className="font-medium">
                    {new Date(draw.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariants[draw.type]}>
                      {typeLabels[draw.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {draw.category || '-'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {draw.invitations.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {draw.crs_min}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(draw.source_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};