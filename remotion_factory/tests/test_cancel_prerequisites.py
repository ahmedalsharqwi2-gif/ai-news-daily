import unittest
from datetime import datetime,timezone
from remotion_factory.cancel_prerequisites import safe_job
class CancellationGuard(unittest.TestCase):
 def job(self):
  return {'run_id':41904681860,'status':'in_progress','steps':[{'name':'Install planning prerequisites','status':'in_progress','started_at':'2026-11-04T20:00:00Z'},{'name':'Freeze original date; verify configured Cairo clock and existing queues','status':'pending'},{'name':'New topic → retained voice → Remotion → full decode → verified configured-time scheduling','status':'pending'}]}
 def test_stuck_installer_with_no_generation_is_eligible(self):
  self.assertTrue(safe_job(self.job(),41904681860,{'episodes':{}},datetime(2026,11,4,20,20,tzinfo=timezone.utc)))
 def test_started_generation_cannot_be_cancelled_by_this_path(self):
  job=self.job();job['steps'][2]['status']='in_progress'
  with self.assertRaises(ValueError):safe_job(job,41904681860,{'episodes':{}},datetime(2026,11,4,20,20,tzinfo=timezone.utc))
 def test_retained_request_or_fresh_install_is_not_eligible(self):
  for ledger,now in [({'episodes':{'film':{'writer_run':41904681860}}},datetime(2026,11,4,20,20,tzinfo=timezone.utc)),({'episodes':{}},datetime(2026,11,4,20,1,tzinfo=timezone.utc))]:
   with self.assertRaises(ValueError):safe_job(self.job(),41904681860,ledger,now)
