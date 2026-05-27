import json
import networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path
import collections

# Load the graph
data = json.loads(Path('graphify-out/graph.json').read_text(encoding="utf-8"))
G = json_graph.node_link_graph(data, edges='links')

print(f"✓ Grafik yüklendi: {G.number_of_nodes()} düğüm, {G.number_of_edges()} kenar\n")

# Get core concepts by degree
degree_dict = dict(G.degree())
top_nodes = sorted(degree_dict.items(), key=lambda x: x[1], reverse=True)[:15]

print("=== ÖNEMLİ KAVRAMLAR (Bağlantı Sayısı) ===")
for nid, degree in top_nodes:
    label = G.nodes[nid].get('label', nid)
    print(f"  • {label} ({degree} bağlantı)")

# Get node types
file_types = collections.defaultdict(list)
for nid, ndata in G.nodes(data=True):
    ftype = ndata.get('file_type', 'unknown')
    file_types[ftype].append((nid, ndata.get('label', nid)))

print("\n=== MODÜL YAPISI ===")
for ftype in sorted(file_types.keys()):
    nodes = file_types[ftype]
    print(f"\n{ftype.upper()} ({len(nodes)} bileşen):")
    for _, label in sorted(nodes, key=lambda x: x[1])[:10]:
        print(f"  • {label}")
    if len(nodes) > 10:
        print(f"  ... ve {len(nodes)-10} daha")

# Analyze hyperedges (architectural patterns)
hyperedges = data.get('graph', {}).get('hyperedges', [])
if hyperedges:
    print("\n=== MİMARİ DESENLERI (Hyperedges) ===")
    for he in hyperedges[:10]:
        print(f"  • {he.get('label', he.get('id', 'Unknown'))}")
        print(f"    Düğümler: {', '.join([G.nodes[n].get('label', n) for n in he.get('nodes', [])[:3]])}")

# Check for god nodes (highly central concepts)
print("\n=== BİLGİ MERKEZLERI ===")
betweenness = nx.betweenness_centrality(G)
top_betweenness = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)[:8]
for nid, centrality in top_betweenness:
    label = G.nodes[nid].get('label', nid)
    print(f"  • {label} (merkezlik: {centrality:.3f})")
