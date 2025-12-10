"""
KT Secure - Organization Hierarchy Validation
Cycle detection for organization parent-child relationships
"""
from typing import Dict, Set, List, Optional


class CycleDetector:
    """
    Detects cycles in organization hierarchy to prevent invalid parent-child relationships.
    Uses DFS-based cycle detection algorithm.
    """
    
    def __init__(self, organizations: Dict[str, Optional[str]]):
        """
        Initialize with organization ID to parent ID mapping.
        
        Args:
            organizations: Dict mapping org_id -> parent_id (None for root orgs)
        """
        self.orgs = organizations
        
    def would_create_cycle(self, org_id: str, new_parent_id: str) -> bool:
        """
        Check if setting new_parent_id as parent of org_id would create a cycle.
        
        Args:
            org_id: The organization we want to update
            new_parent_id: The proposed new parent ID
            
        Returns:
            True if this would create a cycle, False otherwise
        """
        if org_id == new_parent_id:
            return True  # Can't be your own parent
        
        # Traverse up from new_parent to see if we reach org_id
        current = new_parent_id
        visited: Set[str] = set()
        
        while current is not None:
            if current == org_id:
                return True  # Found a cycle
            
            if current in visited:
                return True  # Already a cycle exists
            
            visited.add(current)
            current = self.orgs.get(current)
        
        return False
    
    def find_all_cycles(self) -> List[List[str]]:
        """
        Find all cycles in the current hierarchy.
        
        Returns:
            List of cycles, where each cycle is a list of org IDs
        """
        cycles = []
        visited: Set[str] = set()
        rec_stack: Set[str] = set()
        
        def dfs(node: str, path: List[str]) -> Optional[List[str]]:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            parent = self.orgs.get(node)
            if parent:
                if parent in rec_stack:
                    # Found a cycle - extract it from path
                    cycle_start = path.index(parent)
                    return path[cycle_start:]
                elif parent not in visited:
                    result = dfs(parent, path)
                    if result:
                        return result
            
            path.pop()
            rec_stack.remove(node)
            return None
        
        for org_id in self.orgs:
            if org_id not in visited:
                cycle = dfs(org_id, [])
                if cycle:
                    cycles.append(cycle)
        
        return cycles
    
    def get_ancestors(self, org_id: str) -> List[str]:
        """
        Get all ancestors of an organization.
        
        Args:
            org_id: The organization ID
            
        Returns:
            List of ancestor IDs (parent, grandparent, etc.)
        """
        ancestors = []
        current = self.orgs.get(org_id)
        visited: Set[str] = set()
        
        while current is not None and current not in visited:
            ancestors.append(current)
            visited.add(current)
            current = self.orgs.get(current)
        
        return ancestors
    
    def get_descendants(self, org_id: str) -> List[str]:
        """
        Get all descendants of an organization.
        
        Args:
            org_id: The organization ID
            
        Returns:
            List of descendant IDs
        """
        descendants = []
        
        # Build children map
        children_map: Dict[str, List[str]] = {}
        for oid, parent_id in self.orgs.items():
            if parent_id:
                if parent_id not in children_map:
                    children_map[parent_id] = []
                children_map[parent_id].append(oid)
        
        # BFS to find all descendants
        queue = children_map.get(org_id, []).copy()
        while queue:
            current = queue.pop(0)
            descendants.append(current)
            queue.extend(children_map.get(current, []))
        
        return descendants
    
    def get_depth(self, org_id: str) -> int:
        """
        Get the depth of an organization in the hierarchy.
        
        Args:
            org_id: The organization ID
            
        Returns:
            Depth (0 for root organizations)
        """
        return len(self.get_ancestors(org_id))
    
    def validate_hierarchy(self) -> dict:
        """
        Validate the entire hierarchy and return a report.
        
        Returns:
            Validation report with cycles, max depth, orphans, etc.
        """
        cycles = self.find_all_cycles()
        max_depth = 0
        orphans = []
        
        for org_id in self.orgs:
            depth = self.get_depth(org_id)
            max_depth = max(max_depth, depth)
            
            # Check for orphans (parent doesn't exist)
            parent_id = self.orgs.get(org_id)
            if parent_id and parent_id not in self.orgs:
                orphans.append(org_id)
        
        return {
            "is_valid": len(cycles) == 0 and len(orphans) == 0,
            "cycles": cycles,
            "orphans": orphans,
            "max_depth": max_depth,
            "total_organizations": len(self.orgs)
        }
